import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function buildReactEmbed({ sourceDir, outDir, outfile }) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await build({
    entryPoints: [resolve(sourceDir, 'main.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    outfile: resolve(outDir, outfile),
    loader: {
      '.css': 'css',
      '.json': 'json',
      '.woff': 'file',
      '.woff2': 'file',
      '.ttf': 'file',
    },
    assetNames: '[name]',
    minify: true,
  });

  await copyFile(
    resolve(sourceDir, 'index.html'),
    resolve(outDir, 'index.html'),
  );
}

await buildReactEmbed({
  sourceDir: resolve(repoRoot, 'src/copilotkit-react-embed'),
  outDir: resolve(repoRoot, '.tmp/copilotkit-react-embed'),
  outfile: 'copilotkit-react.js',
});

await buildReactEmbed({
  sourceDir: resolve(repoRoot, 'src/bow-quiz-react-embed'),
  outDir: resolve(repoRoot, '.tmp/bow-quiz-react-embed'),
  outfile: 'bow-quiz.js',
});
