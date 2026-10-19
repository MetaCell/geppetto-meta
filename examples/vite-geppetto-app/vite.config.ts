import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import commonjs from "vite-plugin-commonjs";

/*
 * NIfTI files (.nii.gz) are served as gzip-encoded binary.  Vite's dev server
 * adds a Content-Encoding: gzip header which causes the browser to decompress
 * on the fly, but AMI.js fetches the raw buffer itself. This disables
 * that automatic decompression so AMI.js sees the raw bytes it expects.
 */
const gzipFixPlugin = (): Plugin => {
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
    configurePreviewServer: fixHeader,
  };
};

export default defineConfig({
  plugins: [react(), gzipFixPlugin(), commonjs()],
  optimizeDeps: {
    exclude: [
      "@metacell/geppetto",
      "@metacell/ami",
    ],
  },
  assetsInclude: ["**/*.nii.gz"],
});
