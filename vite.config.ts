import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vono from "@vonojs/vono";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vono()],
  build: {
    rollupOptions: {
      input: "src/entry.client.tsx",
    },
    minify: false,
  },
});
