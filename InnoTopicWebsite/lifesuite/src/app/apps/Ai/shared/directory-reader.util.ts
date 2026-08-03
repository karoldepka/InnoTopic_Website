/** GH #130: reads a user-picked local directory (via the File System Access API) into a flat
 * list of text/code files, for use as generation context - no upload/server round-trip, this
 * all happens in the browser before the (already-existing) category-tree/Q&A generation calls. */

export interface FileTreeEntry {
  /** Path relative to the picked root, e.g. "src/main/kotlin/Foo.kt" - always forward-slash
   * separated regardless of OS, since this only ever travels as a JSON string. */
  path: string;
  isDirectory: boolean;
  /** Present only for files that were actually read (text/code, under the size caps below). */
  content?: string;
}

export interface FileTreeResult {
  rootName: string;
  entries: FileTreeEntry[];
  /** Files that existed but were skipped (binary/unrecognized extension, or over MAX_FILE_BYTES) -
   * surfaced so the UI can tell the user "37 of 52 files included" rather than silently dropping
   * content. */
  skippedCount: number;
}

/** Common source/config/doc extensions - deliberately broad (this feature explicitly starts with
 * "code files e.g. Kotlin" but isn't limited to one language) rather than an exhaustive list. */
const TEXT_FILE_EXTENSIONS = new Set([
  'kt', 'kts', 'java', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'rb', 'go', 'rs',
  'c', 'cc', 'cpp', 'h', 'hpp', 'cs', 'php', 'swift', 'scala', 'dart', 'lua',
  'sh', 'bash', 'zsh', 'ps1', 'sql', 'graphql', 'proto',
  'yml', 'yaml', 'json', 'jsonc', 'xml', 'html', 'htm', 'css', 'scss', 'sass', 'less',
  'md', 'mdx', 'txt', 'gradle', 'properties', 'toml', 'ini', 'env', 'cfg', 'conf',
  'vue', 'svelte',
]);

/** Directories that are near-universally build output, dependency caches, or VCS internals -
 * excluded so e.g. a Gradle/Node project's actual source doesn't get drowned out (or size-capped
 * out) by node_modules/build artifacts the user almost certainly didn't mean to include. */
const EXCLUDED_DIR_NAMES = new Set([
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'target', 'out', '.gradle',
  '.idea', '.vscode', '.vs', 'venv', '.venv', '__pycache__', '.pytest_cache', 'coverage',
  '.next', '.nuxt', '.angular', 'vendor', 'bin', 'obj', '.terraform',
]);

const MAX_FILE_BYTES = 200_000;
const MAX_TOTAL_BYTES = 3_000_000;
const MAX_ENTRIES = 3000;

export function isDirectoryPickerSupported(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).showDirectoryPicker === 'function';
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/** Opens the browser's native directory picker and walks the chosen tree. Resolves to `undefined`
 * if the user cancels the picker (thrown AbortError) - a cancel isn't a failure worth surfacing
 * as an error. */
export async function pickAndReadDirectory(): Promise<FileTreeResult | undefined> {
  let rootHandle: FileSystemDirectoryHandle;
  try {
    rootHandle = await (window as any).showDirectoryPicker({mode: 'read'});
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return undefined;
    }
    throw error;
  }

  const entries: FileTreeEntry[] = [];
  let totalBytes = 0;
  let skippedCount = 0;

  async function walk(dirHandle: FileSystemDirectoryHandle, relativePath: string): Promise<void> {
    for await (const [name, handle] of (dirHandle as any).entries()) {
      if (entries.length >= MAX_ENTRIES) {
        return;
      }
      const path = relativePath ? `${relativePath}/${name}` : name;
      if (handle.kind === 'directory') {
        if (EXCLUDED_DIR_NAMES.has(name)) {
          continue;
        }
        entries.push({path, isDirectory: true});
        await walk(handle as FileSystemDirectoryHandle, path);
      } else {
        const isTextFile = TEXT_FILE_EXTENSIONS.has(getExtension(name));
        if (!isTextFile || totalBytes >= MAX_TOTAL_BYTES) {
          skippedCount++;
          entries.push({path, isDirectory: false});
          continue;
        }
        const file = await (handle as FileSystemFileHandle).getFile();
        if (file.size > MAX_FILE_BYTES) {
          skippedCount++;
          entries.push({path, isDirectory: false});
          continue;
        }
        const content = await file.text();
        totalBytes += content.length;
        entries.push({path, isDirectory: false, content});
      }
    }
  }

  await walk(rootHandle, '');
  return {rootName: rootHandle.name, entries, skippedCount};
}
