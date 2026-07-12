import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'weasel-words': path.resolve(rootDir, 'src/vendor/weasel-words.js'),
      'passive-voice': path.resolve(rootDir, 'src/vendor/passive-voice.js'),
    },
  },
  optimizeDeps: {
    include: ['compromise', 'sentence-splitter', 'text-readability', 'write-good'],
  },
  test: {
    environment: 'jsdom',
  },
});
