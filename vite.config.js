import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        base: './',
        minify: true,
        target: 'esnext'
    },
});
