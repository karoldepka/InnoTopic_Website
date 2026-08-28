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

function recentGitCommits(limit = 50) {
  try {
    const output = execFileSync(
      'git',
      ['log', gitCommit, `--max-count=${limit}`, '--format=%H%x1f%h%x1f%an%x1f%aI%x1f%s%x1e'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );
    return output
      .split('\x1e')
      .map(record => record.trim())
      .filter(Boolean)
      .map(record => {
        const [hash, shortHash, author, committedAt, ...messageParts] = record.split('\x1f');
        return {
          hash,
          shortHash,
          author,
          committedAt,
          message: messageParts.join('\x1f'),
        };
      });
  } catch {
    return [];
  }
}

const recentCommits = recentGitCommits();

const targetFile = resolve(repoRoot, 'src/environments/build-info.ts');

await writeFile(
  targetFile,
  `export const buildInfo = {
  branch: ${JSON.stringify(branch)},
  commit: ${JSON.stringify(commit)},
  commitAuthor: ${JSON.stringify(commitAuthor)},
  commitMessage: ${JSON.stringify(commitMessage)},
  builtAt: ${JSON.stringify(builtAt)},
  recentCommits: ${JSON.stringify(recentCommits, null, 2)},
};
`,
);
