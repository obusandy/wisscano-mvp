import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    testTimeout: 30000, // in-memory MongoDB startup can be slow on first run
    hookTimeout: 30000,
  },
});
