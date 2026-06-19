#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutputDir = path.join(rootDir, '.tmp', 'browser-recordings');
const defaultViewport = { width: 1280, height: 720 };

function usage() {
  return `Browser recorder

Usage:
  npm run record:browser -- --url http://localhost:4207
  npm run record:browser -- --url https://example.com --duration 10000 --headed
  npm run record:browser -- --url http://localhost:4207 --scenario scripts/browser-recorder.example.mjs

Options:
  --url <url>                 Page to open before recording.
  --scenario <file>           Optional JS module exporting default/run/record.
  --out <dir>                 Output directory. Defaults to .tmp/browser-recordings.
  --name <name>               Output file stem. Defaults to recording-<timestamp>.
  --duration <ms>             Passive recording duration after load. Defaults to 5000.
  --width <px>                Viewport/video width. Defaults to 1280.
  --height <px>               Viewport/video height. Defaults to 720.
  --headed                    Show the browser while recording.
  --channel <auto|chrome|msedge>
                              Browser channel. Defaults to auto.
  --wait-until <event>        load, domcontentloaded, networkidle, or commit. Defaults to load.
  --wait-for-selector <css>   Wait for a selector before the recording flow continues.
  --timeout <ms>              Navigation/selector timeout. Defaults to 30000.
  --scroll                    Slowly scroll the page during passive recording.
  --help                      Show this help.
`;
}

function parseArgs(argv) {
  const args = {
    out: defaultOutputDir,
    duration: 5000,
    width: defaultViewport.width,
    height: defaultViewport.height,
    headed: false,
    channel: 'auto',
    waitUntil: 'load',
    timeout: 30000,
    scroll: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${raw}`);
    }

    const [key, inlineValue] = raw.slice(2).split(/=(.*)/s, 2);
    const booleanFlags = new Set(['headed', 'scroll', 'help']);
    const normalizedKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    if (booleanFlags.has(key)) {
      args[normalizedKey] = true;
      continue;
    }

    const value = inlineValue ?? argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    i += inlineValue === undefined ? 1 : 0;
    args[normalizedKey] = value;
  }

  args.duration = parsePositiveInteger(args.duration, 'duration');
  args.width = parsePositiveInteger(args.width, 'width');
  args.height = parsePositiveInteger(args.height, 'height');
  args.timeout = parsePositiveInteger(args.timeout, 'timeout');
  args.out = path.resolve(args.out);
  args.name = sanitizeFileStem(args.name || `recording-${new Date().toISOString().replace(/[:.]/g, '-')}`);

  return args;
}

function parsePositiveInteger(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  return parsed;
}

function sanitizeFileStem(value) {
  return String(value).replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/\s+/g, '-');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchChromium(args) {
  const baseOptions = {
    headless: !args.headed,
    args: ['--disable-dev-shm-usage'],
  };

  const channels = args.channel === 'auto' ? [undefined, 'chrome', 'msedge'] : [args.channel];
  const errors = [];

  for (const channel of channels) {
    let server;
    try {
      server = await chromium.launchServer({
        ...baseOptions,
        ...(channel ? { channel } : {}),
      });
      const browser = await chromium.connect(server.wsEndpoint());
      return {
        browser,
        async close() {
          server.kill();
        },
      };
    } catch (error) {
      if (server) {
        server.kill();
      }
      errors.push(`${channel || 'bundled chromium'}: ${error.message}`);
    }
  }

  throw new Error(`Could not launch Chromium. Tried:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

async function loadScenario(filePath) {
  if (!filePath) {
    return null;
  }

  const scenarioPath = path.resolve(filePath);
  const module = await import(pathToFileURL(scenarioPath).href);
  const scenario = module.default || module.record || module.run;

  if (typeof scenario !== 'function') {
    throw new Error(`Scenario must export a function as default, record, or run: ${scenarioPath}`);
  }

  return { scenario, scenarioPath };
}

async function passiveRecording(page, args) {
  if (!args.scroll) {
    await sleep(args.duration);
    return;
  }

  const endAt = Date.now() + args.duration;
  while (Date.now() < endAt) {
    await page.mouse.wheel(0, Math.max(120, Math.floor(args.height / 3)));
    await sleep(700);
  }
}

async function recordBrowser(args) {
  if (!args.url && !args.scenario) {
    throw new Error('Provide --url, --scenario, or both.');
  }

  await fs.mkdir(args.out, { recursive: true });

  const controller = await launchChromium(args);
  const { browser } = controller;
  const videoDir = path.join(args.out, '.raw');
  await fs.mkdir(videoDir, { recursive: true });

  let context;
  let page;
  let video;
  let contextClosed = false;

  try {
    context = await browser.newContext({
      viewport: { width: args.width, height: args.height },
      ignoreHTTPSErrors: true,
      recordVideo: {
        dir: videoDir,
        size: { width: args.width, height: args.height },
      },
    });

    page = await context.newPage();
    video = page.video();
    page.setDefaultTimeout(args.timeout);
    page.setDefaultNavigationTimeout(args.timeout);

    if (args.url) {
      await page.goto(args.url, { waitUntil: args.waitUntil, timeout: args.timeout });
    }

    if (args.waitForSelector) {
      await page.waitForSelector(args.waitForSelector, { timeout: args.timeout });
    }

    const loadedScenario = await loadScenario(args.scenario);
    const outputPath = path.join(args.out, `${args.name}.webm`);

    if (loadedScenario) {
      await loadedScenario.scenario({
        args,
        browser,
        context,
        page,
        sleep,
        outputDir: args.out,
        outputPath,
        scenarioPath: loadedScenario.scenarioPath,
      });
    } else {
      await passiveRecording(page, args);
    }

    await context.close();
    contextClosed = true;

    if (!video) {
      throw new Error('Playwright did not create a video for this page.');
    }

    await video.saveAs(outputPath);

    return outputPath;
  } finally {
    if (context && !contextClosed) {
      await context.close().catch(() => undefined);
    }
    await controller.close().catch(() => undefined);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(usage());
    return;
  }

  const outputPath = await recordBrowser(args);
  process.stdout.write(`Recorded browser video: ${outputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n\n${usage()}`);
  process.exitCode = 1;
});
