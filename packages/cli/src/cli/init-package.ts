import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { InitAction } from "./init-types";

const SCRIPT_NAME = "dma";
const SCRIPT_VALUE = "dma check .";
const ALT_SCRIPT = "dma:check";

export const ensurePackageScript = (projectRoot: string): InitAction[] => {
  const packagePath = join(resolve(projectRoot), "package.json");
  if (!existsSync(packagePath)) {
    return [
      {
        action: "warned",
        note: "package.json missing — skipped script",
        path: packagePath,
      },
    ];
  }

  let raw: string;
  try {
    raw = readFileSync(packagePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [
      {
        action: "warned",
        note: `unreadable — ${message}`,
        path: packagePath,
      },
    ];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [
      {
        action: "warned",
        note: "invalid JSON — skipped script",
        path: packagePath,
      },
    ];
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return [
      {
        action: "warned",
        note: "package.json is not an object — skipped script",
        path: packagePath,
      },
    ];
  }

  const pkg = parsed as {
    scripts?: Record<string, string>;
  };

  const scripts = pkg.scripts ?? {};
  if (scripts[SCRIPT_NAME] !== undefined || scripts[ALT_SCRIPT] !== undefined) {
    return [
      {
        action: "skipped",
        note: "dma script already present",
        path: packagePath,
      },
    ];
  }

  pkg.scripts = { ...scripts, [SCRIPT_NAME]: SCRIPT_VALUE };
  writeFileSync(`${packagePath}`, `${JSON.stringify(pkg, null, 2)}\n`);
  return [
    {
      action: "created",
      note: `added scripts.${SCRIPT_NAME}`,
      path: packagePath,
    },
  ];
};
