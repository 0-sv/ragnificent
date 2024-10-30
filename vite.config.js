import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.js')
      },
      output: {
        entryFileNames: '[name].js',
        dir: 'dist',
        format: 'iife'
      }
    }
  },
  publicDir: false,
  plugins: [
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Copy manifest.json
        fs.copyFileSync('src/manifest.json', 'dist/manifest.json');
        // Copy popup files
        fs.copyFileSync('src/popup.html', 'dist/popup.html');
        fs.copyFileSync('src/popup.js', 'dist/popup.js');
        // Copy styles
        fs.copyFileSync('src/styles.css', 'dist/styles.css');
      }
    }
  ]
});
