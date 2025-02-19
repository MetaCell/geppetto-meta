import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from "vite-plugin-commonjs";

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
    // vite dev and vite preview use different server, so we need to configure both.
    configurePreviewServer: fixHeader,
  };
};

const aliasThreeForFiber = (): Plugin => {
  return {
    name: "alias-three-for-fiber",
    enforce: "pre",
    resolveId(source, importer) {
      if (source === "three" && importer?.includes("@react-three/fiber")) {
        return this.resolve("three-latest");
      }
      return null;
    },
  };
};

export default defineConfig({
  plugins: [react(), gzipFixPlugin(), commonjs(), aliasThreeForFiber()],
  optimizeDeps: {
    include: ["three-latest"], // Ensure `three-latest` is pre-bundled
    exclude: [
      "@metacell/geppetto-meta-core",
      "@metacell/geppetto-meta-client",
      "@metacell/geppetto-meta-ui",
      "three",
    ],
  },
  assetsInclude: ["**/*.nii.gz"],
});
