import { fileURLToPath } from "node:url";

import { defineConfig } from "astro/config";

export default defineConfig({
	srcDir: "src",
	vite: {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
	},
});
