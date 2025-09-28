import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // resolve: {
  //   alias: {
  //     "react-map-gl": "react-map-gl/dist/esm/index.js",
  //   },
  // },
  // optimizeDeps: {
  //   include: ["react-map-gl"],
  // },
});
