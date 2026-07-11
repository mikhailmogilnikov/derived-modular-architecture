import { parseArgs } from "node:util";
import type { AnalyzeMode } from "../core/types";

export type CliCommand = AnalyzeMode | "init" | "promote";

export interface CliArgs {
  /** Promote only: write to disk when true. */
  apply: boolean;
  command: CliCommand;
  config?: string;
  /** check/doctor: apply safe fixes. */
  fix: boolean;
  format: "human" | "json" | "sarif";
  includePackages: boolean;
  /** True only when `--include-packages` appears on argv. */
  includePackagesExplicit: boolean;
  /** Promote only: feature module name or path. */
  module?: string;
  path: string;
  roots?: string[];
  /** check/doctor: print safe fix plan without writing. */
  suggest: boolean;
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
    argvHasFlag(argv, [
      "--format",
      "--roots",
      "--include-packages",
      "--apply",
      "--fix",
      "--suggest",
    ])
  ) {
    throw new Error(
      "init does not accept --format, --roots, --include-packages, --apply, --fix, or --suggest."
    );
  }
  const [, path = process.cwd()] = positionals;
  return {
    apply: false,
    command: "init",
    config,
    fix: false,
    format: "human",
    includePackages: false,
    includePackagesExplicit: false,
    path,
    roots: undefined,
    suggest: false,
  };
};

const parsePromoteArgs = (
  argv: string[],
  positionals: string[],
  values: { apply?: boolean; config?: string }
): CliArgs => {
  if (
    argvHasFlag(argv, [
      "--format",
      "--roots",
      "--include-packages",
      "--fix",
      "--suggest",
    ])
  ) {
    throw new Error(
      "promote does not accept --format, --roots, --include-packages, --fix, or --suggest."
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
    fix: false,
    format: "human",
    includePackages: false,
    includePackagesExplicit: false,
    module: moduleArg,
    path,
    roots: undefined,
    suggest: false,
  };
};

export const parseCliArgs = (argv: string[]): CliArgs => {
  let values: {
    apply?: boolean;
    config?: string;
    fix?: boolean;
    format?: string;
    "include-packages"?: boolean;
    roots?: string[];
    suggest?: boolean;
  } = {};
  let positionals: string[] = [];

  try {
    const parsed = parseArgs({
      allowPositionals: true,
      args: argv,
      options: {
        apply: { type: "boolean" },
        config: { type: "string" },
        fix: { type: "boolean" },
        format: { default: "human", type: "string" },
        "include-packages": { type: "boolean" },
        roots: { multiple: true, type: "string" },
        suggest: { type: "boolean" },
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

  const fix = values.fix === true;
  const suggest = values.suggest === true;
  if (fix && suggest) {
    throw new Error("Use either --suggest or --fix, not both.");
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
    fix,
    format,
    includePackages: values["include-packages"] ?? false,
    includePackagesExplicit,
    path,
    roots: flattenRoots(values.roots),
    suggest,
  };
};
