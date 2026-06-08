import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = resolve(repoRoot, '.tmp/copilotkit-react-embed');

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [resolve(repoRoot, 'src/copilotkit-react-embed/main.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: resolve(outdir, 'copilotkit-react.js'),
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
  resolve(repoRoot, 'src/copilotkit-react-embed/index.html'),
  resolve(outdir, 'index.html'),
);
