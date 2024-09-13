import * as fs from 'node:fs';
import * as path from 'node:path';

import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
        // './App': './src/App',
        './apolloClient': './src/apollo-client/index',
        './router': './src/router',
      },
      shared: [
        'react',
        'react-dom',
        '@apollo/client',
        'react-redux',
        'react-use-disclosure',
        'react-router-dom',
      ],
    }),

    federation({
      name: 'app2',
      remotes: {
        remoteOzon: 'https://192.168.0.2:13040/assets/remoteEntry.js',
      },
      shared: [
        'react',
        'react-dom',
        '@apollo/client',
        'react-redux',
        'react-use-disclosure',
        'react-router-dom',
      ],
    }),
  ],
  css: {
    postcss: './postcss.config.cjs', // Можно явно указать файл конфигурации PostCSS
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/_mantine";`,
      },
    },
  },
  build: {
    target: 'esnext',
    manifest: true,
    emptyOutDir: true, // This is done during the build of the server
    // outDir: `${PROJECT_ROOT}/dist/public`,
    // outDir: `../server/dist/public`,
    cssCodeSplit: false,
    outDir: `dist`,
    minify: 'esbuild',
    rollupOptions: {
      input: '/src/main.tsx',
      // external: ['react', 'react-dom', 'react-router-dom'],
      // output: {
      //   globals: {
      //     react: 'React',
      //     'react-dom': 'ReactDOM',
      //   },
      // },
    },
    sourcemap: false,
  },
  server: {
    https:
      mode == 'development'
        ? {
            key: fs.readFileSync('/etc/ssl/certs/tls.key'),
            cert: fs.readFileSync('/etc/ssl/certs/tls.crt'),
          }
        : false,
    proxy: {
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
