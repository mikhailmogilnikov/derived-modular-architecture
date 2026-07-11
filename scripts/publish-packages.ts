/**
 * Publish packages/* with workspace protocol rewritten to real semver.
 *
 * `changeset publish` / bare `npm publish` leave `workspace:*` on the registry
 * (breaks installs outside this monorepo). `bun pm pack` rewrites those deps;
 * we then `npm publish` the tarball so the existing npm login / token is used
 * (interactive `bun publish` OIDC is avoided).
 *
 * Publish order: boundaries → biome-plugin → cli → eslint-plugin → oxlint-plugin.
 *
 * 2FA: `NPM_OTP=123456 bun run release`
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const PUBLISH_ORDER = [
  "boundaries",
  "biome-plugin",
  "cli",
  "eslint-plugin",
  "oxlint-plugin",
] as const;

interface PackageJson {
  name: string;
  private?: boolean;
  version: string;
}

const readPackage = (dir: string): PackageJson => {
  const raw = readFileSync(join(dir, "package.json"), "utf8");
  return JSON.parse(raw) as PackageJson;
};

const isAlreadyPublished = (name: string, version: string): boolean => {
  const result = spawnSync(
    "npm",
    ["view", `${name}@${version}`, "version", "--json"],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    return false;
  }
  const stdout = (result.stdout ?? "").trim();
  try {
    return (JSON.parse(stdout) as string) === version;
  } catch {
    return stdout.replaceAll('"', "") === version;
  }
};

const findTarball = (dir: string, before: Set<string>): string => {
  const after = readdirSync(dir).filter((name) => name.endsWith(".tgz"));
  const created = after.filter((name) => !before.has(name));
  if (created.length === 1) {
    return join(dir, created[0]);
  }
  if (after.length === 1) {
    return join(dir, after[0]);
  }
  throw new Error(`Could not find pack tarball in ${dir}`);
};

const run = (cmd: string[], cwd: string): number => {
  const result = spawnSync(cmd[0], cmd.slice(1), {
    cwd,
    stdio: "inherit",
  });
  return result.status ?? 1;
};

const publishOne = (folder: string): void => {
  const dir = join(ROOT, "packages", folder);
  if (!existsSync(join(dir, "package.json"))) {
    throw new Error(`Missing package.json: ${dir}`);
  }

  const pkg = readPackage(dir);
  if (pkg.private) {
    console.log(`skip ${pkg.name} (private)`);
    return;
  }

  if (isAlreadyPublished(pkg.name, pkg.version)) {
    console.log(`skip ${pkg.name}@${pkg.version} (already on npm)`);
    return;
  }

  console.log(`packing ${pkg.name}@${pkg.version} (bun pm pack)`);
  const before = new Set(
    readdirSync(dir).filter((name) => name.endsWith(".tgz"))
  );
  if (run(["bun", "pm", "pack"], dir) !== 0) {
    throw new Error(`bun pm pack failed for ${pkg.name}@${pkg.version}`);
  }

  const tarball = findTarball(dir, before);
  try {
    console.log(`publishing ${pkg.name}@${pkg.version} via npm publish`);
    const otp = process.env.NPM_OTP?.trim();
    const publishCmd = ["npm", "publish", tarball, "--access", "public"];
    if (otp) {
      publishCmd.push(`--otp=${otp}`);
    }
    if (run(publishCmd, dir) !== 0) {
      throw new Error(
        `npm publish failed for ${pkg.name}@${pkg.version}` +
          (otp ? "" : " (set NPM_OTP if 2FA is enabled)")
      );
    }
  } finally {
    try {
      unlinkSync(tarball);
    } catch {
      // ignore cleanup errors
    }
  }
};

for (const folder of PUBLISH_ORDER) {
  publishOne(folder);
}

console.log("creating git tags via changeset tag");
if (run(["bunx", "changeset", "tag"], ROOT) !== 0) {
  throw new Error("changeset tag failed");
}
