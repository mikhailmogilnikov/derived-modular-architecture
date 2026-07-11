import { parseArgs } from "node:util";
import type { AnalyzeMode } from "../core/types";

export type CliCommand = AnalyzeMode | "init";

export interface CliArgs {
  command: CliCommand;
  config?: string;
  format: "human" | "json" | "sarif";
  includePackages: boolean;
  /** True only when `--include-packages` appears on argv. */
  includePackagesExplicit: boolean;
  path: string;
  roots?: string[];
}

const isAnalyzeMode = (value: string): value is AnalyzeMode =>
  value === "check" || value === "doctor";

const isCliCommand = (value: string): value is CliCommand =>
  isAnalyzeMode(value) || value === "init";

const isFormat = (value: string): value is CliArgs["format"] =>
  value === "human" || value === "json" || value === "sarif";

const flattenRoots = (values: string[] | undefined): string[] | undefined => {
  if (values === undefined || values.length === 0) {
    return;
  }
  const roots: string[] = [];
  for (const value of values) {
    for (const part of value.split(",")) {
      const trimmed = part.trim();
      if (trimmed.length > 0) {
        roots.push(trimmed);
      }
    }
  }
  return roots.length > 0 ? roots : undefined;
};

const argvHasFlag = (argv: string[], names: string[]): boolean => {
  for (const arg of argv) {
    for (const name of names) {
      if (arg === name || arg.startsWith(`${name}=`)) {
        return true;
      }
    }
  }
  return false;
};

export const parseCliArgs = (argv: string[]): CliArgs => {
  let values: {
    config?: string;
    format?: string;
    "include-packages"?: boolean;
    roots?: string[];
  } = {};
  let positionals: string[] = [];

  try {
    const parsed = parseArgs({
      allowPositionals: true,
      args: argv,
      options: {
        config: { type: "string" },
        format: { default: "human", type: "string" },
        "include-packages": { type: "boolean" },
        roots: { multiple: true, type: "string" },
      },
    });
    ({ values, positionals } = parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message, { cause: error });
  }

  const [command, path = process.cwd()] = positionals;
  if (!(command && isCliCommand(command))) {
    throw new Error(
      `Unknown command: ${command ?? "(missing)"}. Expected check, doctor, or init.`
    );
  }

  if (command === "init") {
    if (argvHasFlag(argv, ["--format", "--roots", "--include-packages"])) {
      throw new Error(
        "init does not accept --format, --roots, or --include-packages."
      );
    }
    return {
      command: "init",
      config: values.config,
      format: "human",
      includePackages: false,
      includePackagesExplicit: false,
      path,
      roots: undefined,
    };
  }

  const format = values.format ?? "human";
  if (!isFormat(format)) {
    throw new Error(
      `Invalid --format: ${format}. Expected human, json, or sarif.`
    );
  }

  const includePackagesExplicit = values["include-packages"] !== undefined;

  return {
    command,
    config: values.config,
    format,
    includePackages: values["include-packages"] ?? false,
    includePackagesExplicit,
    path,
    roots: flattenRoots(values.roots),
  };
};
