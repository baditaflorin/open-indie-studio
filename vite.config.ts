import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json' with { type: 'json' };

const repoName = 'open-indie-studio';

function readGitValue(command: string, fallback: string): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
}

const headCommit = readGitValue('git rev-parse --short HEAD', 'dev');
const sourceCommit =
  process.env.VITE_GIT_COMMIT ??
  readGitValue("git log -1 --format=%h -- . ':(exclude)docs'", headCommit);
const gitBranch =
  process.env.VITE_GIT_BRANCH ?? readGitValue('git rev-parse --abbrev-ref HEAD', 'local');

export default defineConfig({
  base: process.env.PAGES_BASE ?? `/${repoName}/`,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      manifest: {
        name: 'Open Indie Studio',
        short_name: 'Indie Studio',
        description:
          'Browser-based toolkit for making, testing, packaging, and documenting small 2D/casual indie games.',
        theme_color: '#0e2f35',
        background_color: '#f7f1e2',
        display: 'standalone',
        scope: `/${repoName}/`,
        start_url: `/${repoName}/`,
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,json,webmanifest}'],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __GIT_COMMIT__: JSON.stringify(sourceCommit),
    __GIT_BRANCH__: JSON.stringify(gitBranch),
    __REPO_URL__: JSON.stringify('https://github.com/baditaflorin/open-indie-studio'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita'),
  },
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) {
            return 'three';
          }
          if (id.includes('/node_modules/tone/')) {
            return 'tone';
          }
          if (id.includes('/node_modules/yjs/')) {
            return 'yjs';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
