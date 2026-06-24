import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// Two modes from one config:
//  - `vite`         → dev server using index.html + src/dev.tsx (live HA over WebSocket)
//  - `vite build`   → single self-contained ESM file dist/dashboard.js for HACS
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Inline the CSS into the JS bundle so HACS only has to serve ONE file.
    cssInjectedByJsPlugin(),
  ],
  // Vite's lib mode does NOT replace process.env.NODE_ENV (it assumes a
  // downstream bundler will). But we ship a finished, self-contained file, so
  // we must force React's production build ourselves — otherwise the dev build
  // (~5x larger, full of warnings) gets bundled. Only for `build`, so dev keeps
  // React's development build and proper warnings.
  define:
    command === 'build'
      ? { 'process.env.NODE_ENV': JSON.stringify('production') }
      : {},
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    // HACS ships a single dashboard.js (see release.yml). No code-splitting.
    lib: {
      entry: 'src/panel.tsx',
      formats: ['es'],
      fileName: () => 'dashboard.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
}));
