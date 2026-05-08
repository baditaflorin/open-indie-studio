import { readdir, rm } from 'node:fs/promises';

const generatedPaths = [
  'docs/assets',
  'docs/index.html',
  'docs/404.html',
  'docs/registerSW.js',
  'docs/sw.js',
  'docs/sw.js.map',
  'docs/manifest.webmanifest',
];

for (const path of generatedPaths) {
  await rm(path, { recursive: true, force: true });
}

try {
  const entries = await readdir('docs');
  await Promise.all(
    entries
      .filter((entry) => entry.startsWith('workbox-'))
      .map((entry) => rm(`docs/${entry}`, { force: true })),
  );
} catch {
  // docs/ may not exist before the first build.
}
