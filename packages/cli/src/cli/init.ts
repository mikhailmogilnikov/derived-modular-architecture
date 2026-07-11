import { relative, resolve } from "node:path";
import { ensureAgentsMd } from "./init-agents";
import { ensurePackageScript } from "./init-package";
import { scaffoldProject } from "./init-scaffold";
import type { InitAction } from "./init-types";
import type { CliArgs } from "./parse-args";

const LINT_HINTS = `
Linter companions (optional — do not replace dma check in CI):
  npm i -D @derived-modular/eslint-plugin
  npm i -D @derived-modular/oxlint-plugin
  npm i -D @derived-modular/biome-plugin

Docs: https://github.com/mikhailmogilnikov/derived-modular-architecture
`.trim();

const toLabel = (path: string, cwd: string): string => {
  const rel = relative(cwd, path);
  return (rel === "" ? path : rel).split("\\").join("/");
};

const formatSummary = (actions: InitAction[], cwd: string): string => {
  const lines = ["dma init", ""];
  for (const item of actions) {
    const label = toLabel(item.path, cwd);
    const note = item.note === undefined ? "" : ` (${item.note})`;
    lines.push(`  ${item.action.padEnd(8)} ${label}${note}`);
  }
  lines.push("", LINT_HINTS);
  return `${lines.join("\n")}\n`;
};

export const runInit = async (args: CliArgs): Promise<number> => {
  const projectRoot = resolve(args.path);
  const cwd = process.cwd();
  const actions: InitAction[] = [];

  actions.push(
    ...(await scaffoldProject({
      config: args.config,
      projectRoot,
    }))
  );
  actions.push(...ensurePackageScript(projectRoot));
  actions.push(...ensureAgentsMd(projectRoot));

  process.stdout.write(formatSummary(actions, cwd));
  return 0;
};
