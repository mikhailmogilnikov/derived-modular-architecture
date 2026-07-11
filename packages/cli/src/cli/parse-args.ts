import { parseArgs } from "node:util";
import type { AnalyzeMode } from "../core/types";

export type CliCommand = AnalyzeMode | "init" | "promote";

export interface CliArgs {
  /** Promote only: write to disk when true. */
  apply: boolean;
  command: CliCommand;
  config?: string;
  format: "human" | "json" | "sarif";
  includePackages: boolean;
  /** True only when `--include-packages` appears on argv. */
  includePackagesExplicit: boolean;
  /** Promote only: feature module name or path. */
  module?: string;
  path: string;
  roots?: string[];
}

const isAnalyzeMode = (value: string): value is AnalyzeMode =>
  value === "check" || value === "doctor";

const isCliCommand = (value: string): value is CliCommand =>
  isAnalyzeMode(value) || value === "init" || value === "promote";

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

const parseInitArgs = (
  argv: string[],
  positionals: string[],
  config?: string
): CliArgs => {
  if (
    argvHasFlag(argv, ["--format", "--roots", "--include-packages", "--apply"])
  ) {
    throw new Error(
      "init does not accept --format, --roots, --include-packages, or --apply."
    );
  }
  const [, path = process.cwd()] = positionals;
  return {
    apply: false,
    command: "init",
    config,
    format: "human",
    includePackages: false,
    includePackagesExplicit: false,
    path,
    roots: undefined,
  };
};

const parsePromoteArgs = (
  argv: string[],
  positionals: string[],
  values: { apply?: boolean; config?: string }
): CliArgs => {
  if (argvHasFlag(argv, ["--format", "--roots", "--include-packages"])) {
    throw new Error(
      "promote does not accept --format, --roots, or --include-packages."
    );
  }
  const [, moduleArg, path = process.cwd()] = positionals;
  if (!moduleArg) {
    throw new Error(
      "promote requires a module name, e.g. dma promote features/promo"
    );
  }
  return {
    apply: values.apply === true,
    command: "promote",
    config: values.config,
    format: "human",
    includePackages: false,
    includePackagesExplicit: false,
    module: moduleArg,
    path,
    roots: undefined,
  };
};

export const parseCliArgs = (argv: string[]): CliArgs => {
  let values: {
    apply?: boolean;
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
        apply: { type: "boolean" },
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

  const [command] = positionals;
  if (!(command && isCliCommand(command))) {
    throw new Error(
      `Unknown command: ${command ?? "(missing)"}. Expected check, doctor, init, or promote.`
    );
  }

  if (command === "init") {
    return parseInitArgs(argv, positionals, values.config);
  }

  if (command === "promote") {
    return parsePromoteArgs(argv, positionals, values);
  }

  if (values.apply === true) {
    throw new Error("--apply is only valid with promote.");
  }

  const format = values.format ?? "human";
  if (!isFormat(format)) {
    throw new Error(
      `Invalid --format: ${format}. Expected human, json, or sarif.`
    );
  }

  const includePackagesExplicit = values["include-packages"] !== undefined;
  const [, path = process.cwd()] = positionals;

  return {
    apply: false,
    command,
    config: values.config,
    format,
    includePackages: values["include-packages"] ?? false,
    includePackagesExplicit,
    path,
    roots: flattenRoots(values.roots),
  };
};
