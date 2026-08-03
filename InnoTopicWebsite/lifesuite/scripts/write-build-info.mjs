import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const branch = (process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || 'local').trim() || 'local';
const fullCommit = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || '').trim();
const commit = fullCommit ? fullCommit.slice(0, 8) : 'local';
const builtAt = new Date().toISOString();

const targetFile = resolve(repoRoot, 'src/environments/build-info.ts');

await writeFile(
  targetFile,
  `export const buildInfo = {
  branch: ${JSON.stringify(branch)},
  commit: ${JSON.stringify(commit)},
  builtAt: ${JSON.stringify(builtAt)},
};
`,
);
