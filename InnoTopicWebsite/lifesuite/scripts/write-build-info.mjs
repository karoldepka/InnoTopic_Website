import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const branch = (process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || 'local').trim() || 'local';
const fullCommit = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || '').trim();
const commit = fullCommit ? fullCommit.slice(0, 8) : 'local';
const gitCommit = fullCommit || 'HEAD';

function gitShow(format) {
  try {
    return execFileSync('git', ['show', '-s', `--format=${format}`, gitCommit], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

const commitAuthor = gitShow('%an');
const commitMessage = gitShow('%s');
const builtAt = new Date().toISOString();

const targetFile = resolve(repoRoot, 'src/environments/build-info.ts');

await writeFile(
  targetFile,
  `export const buildInfo = {
  branch: ${JSON.stringify(branch)},
  commit: ${JSON.stringify(commit)},
  commitAuthor: ${JSON.stringify(commitAuthor)},
  commitMessage: ${JSON.stringify(commitMessage)},
  builtAt: ${JSON.stringify(builtAt)},
};
`,
);
