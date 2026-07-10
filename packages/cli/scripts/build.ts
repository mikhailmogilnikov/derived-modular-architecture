import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { build, file } from "bun";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");

rmSync(dist, { force: true, recursive: true });
mkdirSync(dist, { recursive: true });

const cli = await build({
  entrypoints: [join(root, "src/cli/main.ts")],
  format: "esm",
  minify: false,
  naming: "cli.js",
  outdir: dist,
  packages: "external",
  sourcemap: "external",
  target: "node",
});

if (!cli.success) {
  console.error(...cli.logs);
  process.exit(1);
}

const api = await build({
  entrypoints: [join(root, "src/index.ts")],
  format: "esm",
  minify: false,
  naming: "index.js",
  outdir: dist,
  packages: "external",
  sourcemap: "external",
  target: "node",
});

if (!api.success) {
  console.error(...api.logs);
  process.exit(1);
}

// Ensure Node can execute the bin without Bun installed.
const cliPath = join(dist, "cli.js");
const bundled = (await file(cliPath).text())
  .replace(/^#!.*\n/, "")
  .replace(/^\/\/ @bun\n/, "");
writeFileSync(cliPath, `#!/usr/bin/env node\n${bundled}`);
chmodSync(cliPath, 0o755);

const dts = spawnSync("bunx", ["tsc", "-p", "tsconfig.build.json"], {
  cwd: root,
  stdio: "inherit",
});

if (dts.status !== 0) {
  process.exit(dts.status ?? 1);
}

console.log("built dist/cli.js, dist/index.js, and declarations");
