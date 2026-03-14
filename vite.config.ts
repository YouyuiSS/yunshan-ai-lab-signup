import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function normalizeBasePath(value?: string) {
  if (!value || value === '/') {
    return '/';
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function parseAllowedHosts(value?: string) {
  if (!value) {
    return undefined;
  }

  const hosts = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return hosts.length > 0 ? hosts : undefined;
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const basePath = normalizeBasePath(env.APP_BASE_PATH);
  const allowedHosts = parseAllowedHosts(env.VITE_ALLOWED_HOSTS);
  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      allowedHosts,
      port: Number(env.VITE_PORT || '3000'),
      proxy: {
        [`${basePath}api`]: {
          target: `http://127.0.0.1:${env.API_PORT || '8787'}`,
          changeOrigin: true,
        },
      },
    },
  };
});
