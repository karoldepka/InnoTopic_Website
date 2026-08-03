# Browser Recording

This project includes a Playwright-based recorder for turning a browser session into a WebM video.

## Quick Start

Install the managed recording browser and encoder once per machine or CI image:

```bash
npm run record:browser:install
```

Start the app in one terminal:

```bash
npm start
```

Record the local app from another terminal:

```bash
npm run record:browser:local -- --duration 10000
```

Record any URL:

```bash
npm run record:browser -- --url https://example.com --duration 8000 --headed
```

Videos are written to `.tmp/browser-recordings` by default.

## Scripted Flows

For repeatable demos, pass a scenario module:

```bash
npm run record:browser -- --url http://localhost:4207 --scenario scripts/browser-recorder.example.mjs --name local-demo
```

A scenario exports a function as `default`, `run`, or `record`:

```js
export default async function recordFlow({ page, sleep }) {
  await page.click('text=Timers');
  await sleep(1000);
  await page.mouse.wheel(0, 600);
  await sleep(1000);
}
```

## Useful Options

```bash
--out .tmp/browser-recordings
--name demo
--width 1280
--height 720
--headed
--channel chrome
--wait-for-selector "app-root"
--scroll
```

The recorder uses `playwright-core@1.43.1` so it remains compatible with this repo's Node 16 runtime. It records the viewport as WebM video without audio.
