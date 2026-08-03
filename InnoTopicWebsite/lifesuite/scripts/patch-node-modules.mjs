import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// @capacitor-community/safe-area@8.0.1 ships a build.gradle still using
// getDefaultProguardFile('proguard-android.txt'), which AGP 9.x hard-rejects (it forces
// -dontoptimize, blocking R8 optimizations - see the identical fix already applied to this
// project's own android/app/build.gradle). Not fixed upstream yet, so patch it in node_modules
// on every install rather than editing android/app/build.gradle's copy of the file directly,
// which npm would silently overwrite on the next install.
const patches = [
  {
    file: 'node_modules/@capacitor-community/safe-area/android/build.gradle',
    from: "getDefaultProguardFile('proguard-android.txt')",
    to: "getDefaultProguardFile('proguard-android-optimize.txt')",
  },
];

for (const { file, from, to } of patches) {
  const targetFile = resolve(repoRoot, file);
  let contents;
  try {
    contents = await readFile(targetFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`patch-node-modules: ${file} not present, skipping`);
      continue;
    }
    throw error;
  }
  if (!contents.includes(from)) {
    console.log(`patch-node-modules: ${file} already patched or changed upstream, skipping`);
    continue;
  }
  await writeFile(targetFile, contents.replace(from, to));
  console.log(`patch-node-modules: patched ${file}`);
}
