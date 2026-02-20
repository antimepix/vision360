import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setupTests.js"],
    include: ["src/tests/**/*.{test,spec}.{js,jsx}"],
    css: true,
  },
  projectId: "f4u3ix",
});