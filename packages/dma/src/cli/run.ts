import { analyze } from "../core/analyze";
import { DmaEnvironmentError } from "../core/errors";
import type { AnalyzeMode, Diagnostic } from "../core/types";
import { formatHuman } from "./format-human";
import { formatJson } from "./format-json";
import { formatSarif } from "./format-sarif";
import { parseCliArgs } from "./parse-args";

const formatReport = (
  format: "human" | "json" | "sarif",
  command: AnalyzeMode,
  diagnostics: Diagnostic[]
): string => {
  if (format === "json") {
    return formatJson(command, diagnostics);
  }
  if (format === "sarif") {
    return formatSarif(command, diagnostics);
  }
  return formatHuman(command, diagnostics);
};

const formatCliError = (message: string): string => {
  const useColor =
    process.env.NO_COLOR === undefined && Boolean(process.stderr.isTTY);
  const prefix = useColor ? "\u001B[1m\u001B[31merror\u001B[0m" : "error";
  return `${prefix} ${message}\n`;
};

export const runCli = (argv: string[]): number => {
  try {
    const args = parseCliArgs(argv);
    const { diagnostics } = analyze(args.path, args.command);
    const report = formatReport(args.format, args.command, diagnostics);
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
