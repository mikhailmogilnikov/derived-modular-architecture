import type { AnalyzeMode, Diagnostic } from "../core/types";

export interface FormatJsonOptions {
  projects?: string[];
}

export interface Report {
  command: AnalyzeMode;
  diagnostics: Diagnostic[];
  projects?: string[];
  summary: {
    errors: number;
    infos: number;
    warnings: number;
  };
  version: 1;
}

const countBySeverity = (diagnostics: Diagnostic[]): Report["summary"] => {
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === "error") {
      errors += 1;
    } else if (diagnostic.severity === "warning") {
      warnings += 1;
    } else {
      infos += 1;
    }
  }
  return { errors, infos, warnings };
};

export const formatJson = (
  command: AnalyzeMode,
  diagnostics: Diagnostic[],
  options?: FormatJsonOptions
): string => {
  const report: Report = {
    command,
    diagnostics,
    summary: countBySeverity(diagnostics),
    version: 1,
  };
  if (options?.projects !== undefined && options.projects.length > 1) {
    report.projects = options.projects;
  }
  return JSON.stringify(report, null, 2);
};
