import { defineConfig } from 'vite';

export default defineConfig({
  base: '/star_warriors/', 
  root: './',
  publicDir: 'sounds',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'game-core': ['./src/core/Game.js', './src/core/GameObject.js'],
          'game-systems': ['./src/systems/index.js'],
          'game-entities': ['./src/entities/player/index.js', './src/entities/enemies/index.js']
        }
      }
    }
  }
});
