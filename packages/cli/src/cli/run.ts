import { relative } from "node:path";
import { analyze } from "../core/analyze";
import { DmaEnvironmentError } from "../core/errors";
import { loadConfig } from "../core/load-config";
import type { AnalyzeMode, Diagnostic } from "../core/types";
import { formatHuman } from "./format-human";
import { formatJson } from "./format-json";
import { formatSarif } from "./format-sarif";
import { mergeOptions } from "./merge-options";
import { parseCliArgs } from "./parse-args";
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

export const runCli = async (argv: string[]): Promise<number> => {
  try {
    const args = parseCliArgs(argv);
    const loaded = await loadConfig(args.path, args.config);
    const options = mergeOptions(args, loaded);
    const roots = resolveRoots(args, options);
    const isMulti = roots.length > 1;
    const cwd = process.cwd();
    const diagnostics: Diagnostic[] = [];
    const layout = {
      compositionRoots: options.compositionRoots,
      srcRoot: options.srcRoot,
    };

    for (const root of roots) {
      const result = analyze(root, args.command, layout);
      if (isMulti) {
        const project = toProjectLabel(root, cwd);
        for (const diagnostic of result.diagnostics) {
          diagnostics.push({ ...diagnostic, project });
        }
      } else {
        diagnostics.push(...result.diagnostics);
      }
    }

    const formatOptions: FormatOptions | undefined = isMulti
      ? { projects: roots.map((root) => toProjectLabel(root, cwd)) }
      : undefined;

    const report = formatReport(
      args.format,
      args.command,
      diagnostics,
      formatOptions
    );
    process.stdout.write(`${report}\n`);

    if (
      args.command === "check" &&
      diagnostics.some((d) => d.severity === "error")
    ) {
      return 1;
    }
    return 0;
  } catch (error) {
    if (error instanceof DmaEnvironmentError || error instanceof Error) {
      process.stderr.write(formatCliError(error.message));
      return 2;
    }
    process.stderr.write(formatCliError("Unexpected CLI failure"));
    return 2;
  }
};
