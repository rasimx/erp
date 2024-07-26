import * as path from 'node:path';

import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    federation({
      name: 'remote_app',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './apolloClient': './src/apollo-client/index',
      },
      shared: [
        'react',
        'react-dom',
        '@apollo/client',
        '@mui/material',
        // 'react-router-dom',
        'react-redux',
        'react-use-disclosure',
      ],
    }),

    federation({
      name: 'app2',
      remotes: {
        remoteOzon: 'https://localhost:3003/assets/remoteEntry.js',
      },
      shared: [
        'react',
        'react-dom',
        '@apollo/client',
        '@mui/material',
        'react-redux',
        'react-use-disclosure',
      ],
    }),
    mkcert(),
  ],
  build: {
    target: 'esnext',
    manifest: true,
    emptyOutDir: false, // This is done during the build of the server
    // outDir: `${PROJECT_ROOT}/dist/public`,
    // outDir: `../server/dist/public`,
    outDir: `dist`,
    rollupOptions: {
      input: '/src/main.tsx',
    },
  },
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
