import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@context': path.resolve(__dirname, './src/context'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@assets': path.resolve(__dirname, '../attached_assets'),
      },
    },
    // When built in production mode, the output will be in the 'dist' directory
    build: {
      outDir: 'dist',
      // Generate separate chunk for vendor libs
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
            ui: [
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
              'tailwindcss-animate',
            ],
          },
        },
      },
    },
    // Adjust the server options for development
    server: {
      port: 5173,
      strictPort: true,
      host: true, // Listen on all addresses including LAN and public addresses
      // If using HTTPS
      // https: {
      //   key: fs.readFileSync('key.pem'),
      //   cert: fs.readFileSync('cert.pem'),
      // },
    },
  };
});