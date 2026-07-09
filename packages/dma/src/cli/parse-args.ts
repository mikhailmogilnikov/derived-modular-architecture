import { parseArgs } from "node:util";
import type { AnalyzeMode } from "../core/types";

export interface CliArgs {
  command: AnalyzeMode;
  format: "human" | "json" | "sarif";
  path: string;
}

const isAnalyzeMode = (value: string): value is AnalyzeMode =>
  value === "check" || value === "doctor";

const isFormat = (value: string): value is CliArgs["format"] =>
  value === "human" || value === "json" || value === "sarif";

export const parseCliArgs = (argv: string[]): CliArgs => {
  let values: { format?: string } = {};
  let positionals: string[] = [];

  try {
    const parsed = parseArgs({
      allowPositionals: true,
      args: argv,
      options: {
        format: { default: "human", type: "string" },
      },
    });
    ({ values, positionals } = parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message, { cause: error });
  }

  const [command, path = process.cwd()] = positionals;
  if (!(command && isAnalyzeMode(command))) {
    throw new Error(
      `Unknown command: ${command ?? "(missing)"}. Expected check or doctor.`
    );
  }

  const format = values.format ?? "human";
  if (!isFormat(format)) {
    throw new Error(
      `Invalid --format: ${format}. Expected human, json, or sarif.`
    );
  }

  return { command, format, path };
};
