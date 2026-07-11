import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { InitAction } from "./init-types";

const SCRIPT_NAME = "dma";
const SCRIPT_VALUE = "dma check .";
const ALT_SCRIPT = "dma:check";
const INDENT_RE = /\n([ \t]+)"/;

const detectIndent = (raw: string): number => {
  const match = INDENT_RE.exec(raw);
  if (!match?.[1]) {
    return 2;
  }
  if (match[1].includes("\t")) {
    return 2;
  }
  return Math.min(8, Math.max(2, match[1].length));
};

const endsWithNewline = (raw: string): boolean => raw.endsWith("\n");

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

  // Mutate in place to preserve top-level key order from JSON.parse.
  pkg.scripts = { ...scripts, [SCRIPT_NAME]: SCRIPT_VALUE };
  const indent = detectIndent(raw);
  const body = `${JSON.stringify(pkg, null, indent)}`;
  const next = endsWithNewline(raw) ? `${body}\n` : body;
  writeFileSync(packagePath, next);
  return [
    {
      action: "created",
      note: `added scripts.${SCRIPT_NAME}`,
      path: packagePath,
    },
  ];
};
