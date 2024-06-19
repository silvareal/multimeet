import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { compression } from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    compression(),
    compression({
      algorithm: "brotliCompress",
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
  ],
  resolve: {
    alias: {
      "@mui/lab": "@mui/lab",
      apis: path.resolve(__dirname, "src/apis"),
      assets: path.resolve(__dirname, "src/assets"),
      common: path.resolve(__dirname, "src/common"),
      configs: path.resolve(__dirname, "src/configs"),
      constants: path.resolve(__dirname, "src/constants"),
      features: path.resolve(__dirname, "src/features"),
      hooks: path.resolve(__dirname, "src/hooks"),
      pages: path.resolve(__dirname, "src/pages"),
      utils: path.resolve(__dirname, "src/utils"),
    },
  },
});
