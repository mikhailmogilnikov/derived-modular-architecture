/// <reference types="vitest/config" />

import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"@": srcDir,
		},
	},
	test: {
		environment: "node",
	},
});
