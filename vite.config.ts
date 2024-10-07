import { defineConfig } from 'vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

export default defineConfig({
    plugins: [
        ViteMinifyPlugin({}),
    ],
    server: {
        port: 3000,
    },
    build: {
        target: 'esnext',
    },
});
