import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative assets work on both a repository Pages URL and a custom domain.
  base: process.env.VITE_BASE_PATH ?? './',
});
