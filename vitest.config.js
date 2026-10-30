import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vitest only: Next.js has its own compiler for dev/build.
export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.jsx"],
    css: false,
    include: ["src/tests/**/*.test.{js,jsx}"],
  },
});
