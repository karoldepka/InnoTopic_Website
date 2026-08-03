import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, '..', 'src', 'assets');
const dest = path.join(here, '..', 'dist', 'assets');

if (!existsSync(src)) {
  console.error(`copy-assets: source folder not found: ${src}`);
  process.exit(1);
}

cpSync(src, dest, { recursive: true });
console.log(`copy-assets: copied ${src} -> ${dest}`);
