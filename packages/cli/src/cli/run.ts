import { relative } from "node:path";
import { type AnalyzeOptions, analyze } from "../core/analyze";
import { DmaEnvironmentError } from "../core/errors";
import { loadConfig } from "../core/load-config";
import type { AnalyzeMode, Diagnostic } from "../core/types";
import { applyFixPlan } from "./fix-apply";
import { buildFixPlan, formatFixPlan } from "./fix-plan";
import { formatHuman } from "./format-human";
import { formatJson } from "./format-json";
import { formatSarif } from "./format-sarif";
import { runInit } from "./init";
import { mergeOptions } from "./merge-options";
import type { CliArgs } from "./parse-args";
import { parseCliArgs } from "./parse-args";
import { runPromote } from "./promote";
import { resolveRoots } from "./resolve-roots";

export interface FormatOptions {
  projects?: string[];
}

const toProjectLabel = (root: string, cwd: string): string => {
  const rel = relative(cwd, root);
  return (rel === "" ? "." : rel).split("\\").join("/");
};

const formatReport = (
  format: "human" | "json" | "sarif",
  command: AnalyzeMode,
  diagnostics: Diagnostic[],
  options?: FormatOptions
): string => {
  if (format === "json") {
    return formatJson(command, diagnostics, options);
  }
  if (format === "sarif") {
    return formatSarif(command, diagnostics);
  }
  return formatHuman(command, diagnostics, options);
};

const formatCliError = (message: string): string => {
  const useColor =
    process.env.NO_COLOR === undefined && Boolean(process.stderr.isTTY);
  const prefix = useColor ? "\u001B[1m\u001B[31merror\u001B[0m" : "error";
  return `${prefix} ${message}\n`;
};

const collectDiagnostics = (
  roots: string[],
  command: AnalyzeMode,
  layout: AnalyzeOptions,
  cwd: string
): { diagnostics: Diagnostic[]; formatOptions?: FormatOptions } => {
  const isMulti = roots.length > 1;
  const diagnostics: Diagnostic[] = [];

  for (const root of roots) {
    const result = analyze(root, command, layout);
    if (isMulti) {
      const project = toProjectLabel(root, cwd);
      for (const diagnostic of result.diagnostics) {
        diagnostics.push({ ...diagnostic, project });
      }
    } else {
      diagnostics.push(...result.diagnostics);
    }
  }

  return {
    diagnostics,
    formatOptions: isMulti
      ? { projects: roots.map((root) => toProjectLabel(root, cwd)) }
      : undefined,
  };
};

const exitForDiagnostics = (
  command: AnalyzeMode,
  diagnostics: Diagnostic[]
): number => {
  if (command === "check" && diagnostics.some((d) => d.severity === "error")) {
    return 1;
  }
  return 0;
};

const runSuggestOrFix = (
  args: CliArgs,
  roots: string[],
  layout: AnalyzeOptions,
  cwd: string
): number | null => {
  if (!(args.suggest || args.fix)) {
    return null;
  }
  if (args.command !== "check" && args.command !== "doctor") {
    throw new DmaEnvironmentError(
      "--suggest/--fix are only valid with check or doctor."
    );
  }
  const mode: AnalyzeMode = args.command;
  if (roots.length !== 1) {
    throw new DmaEnvironmentError(
      `--${args.fix ? "fix" : "suggest"} requires a single project root (got ${roots.length}).`
    );
  }
  const [root] = roots;
  if (!root) {
    throw new DmaEnvironmentError("No project root resolved.");
  }

  const plan = buildFixPlan(root, mode, layout);
  process.stdout.write(formatFixPlan(plan, args.fix));

  if (args.suggest) {
    const { diagnostics, formatOptions } = collectDiagnostics(
      roots,
      mode,
      layout,
      cwd
    );
    process.stdout.write(
      `${formatReport(args.format, mode, diagnostics, formatOptions)}\n`
    );
    return exitForDiagnostics(mode, diagnostics);
  }

  if (plan.actions.length > 0) {
    const result = applyFixPlan(plan);
    process.stdout.write(`\nApplied ${result.applied} fix(es).\n\n`);
  }
  return null;
};

export const runCli = async (argv: string[]): Promise<number> => {
  try {
    const args = parseCliArgs(argv);
    if (args.command === "init") {
      return await runInit(args);
    }
    if (args.command === "promote") {
      return await runPromote(args);
    }

    const loaded = await loadConfig(args.path, args.config);
    const options = mergeOptions(args, loaded);
    const roots = resolveRoots(args, options);
    const cwd = process.cwd();
    const layout: AnalyzeOptions = {
      compositionRoots: options.compositionRoots,
      srcRoot: options.srcRoot,
      thresholds: options.thresholds,
    };

    const early = runSuggestOrFix(args, roots, layout, cwd);
    if (early !== null) {
      return early;
    }

    const { diagnostics, formatOptions } = collectDiagnostics(
      roots,
      args.command,
      layout,
      cwd
    );
    process.stdout.write(
      `${formatReport(args.format, args.command, diagnostics, formatOptions)}\n`
    );
    return exitForDiagnostics(args.command, diagnostics);
  } catch (error) {
    if (error instanceof DmaEnvironmentError || error instanceof Error) {
      process.stderr.write(formatCliError(error.message));
      return 2;
    }
    process.stderr.write(formatCliError("Unexpected CLI failure"));
    return 2;
  }
};
