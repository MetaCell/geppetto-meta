import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const gzipFixPlugin = () => {
  const fixHeader = (server) => {
    server.middlewares.use((req, res, next) => {
      if (req.originalUrl?.includes(".gz")) {
        res.setHeader("Content-Type", "gzip");
        res.setHeader("Content-Encoding", "invalid-data");
      }
      next();
    });
  };

  return {
    name: "gzip-fix-plugin",
    configureServer: fixHeader,
    // vite dev and vite preview use different server, so we need to configure both.
    configurePreviewServer: fixHeader,
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), gzipFixPlugin()],
  optimizeDeps: {
    exclude: ['@metacell/geppetto-meta-core', '@metacell/geppetto-meta-client', '@metacell/geppetto-meta-ui']
  },
  assetsInclude: ['**/*.nii.gz'],
})
