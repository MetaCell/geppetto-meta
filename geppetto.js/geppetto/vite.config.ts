import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

/*
 * Pushes to the local yalc store after each rebuild in watch mode so consumer
 * apps pick up changes without a manual yalc publish.
 */
function yalcPushPlugin(): Plugin {
  const watchMode = process.argv.includes("--watch") || process.argv.includes("-w");
  return {
    name: "vite-plugin-yalc-push",
    closeBundle() {
      if (watchMode) {
        try {
          execSync("yalc push --changed", { stdio: "inherit" });
        } catch {
          /* yalc not initialised yet */
        }
      }
    },
  };
}

/*
 * Copies static CSS files from src/ into dist preserving their path.
 * Used for the FlexLayout theme files which are not imported from TypeScript.
 */
function copyStaticCss(srcGlob: string, destDir: string): Plugin {
  return {
    name: "copy-static-css",
    generateBundle() {
      try {
        for (const file of readdirSync(srcGlob)) {
          if (file.endsWith(".css")) {
            this.emitFile({
              type: "asset",
              fileName: `${destDir}/${file}`,
              source: readFileSync(`${srcGlob}/${file}`, "utf-8"),
            });
          }
        }
      } catch {
        /* directory may not exist in a partial build */
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    dts({ include: ["src"], entryRoot: "src" }),
    copyStaticCss("src/layout/styles", "layout/styles"),
    yalcPushPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: (id: string) => !id.startsWith(".") && !id.startsWith("/") && !id.startsWith("\0"),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
    sourcemap: mode === "development",
    minify: false,
  },
}));
