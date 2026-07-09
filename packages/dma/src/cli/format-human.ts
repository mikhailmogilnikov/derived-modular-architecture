import { relative } from "node:path";
import type { AnalyzeMode, Diagnostic } from "../core/types";

const displayPath = (file: string): string => {
  const rel = relative(process.cwd(), file);
  return rel === "" ? file : rel;
};

const formatLocation = (diagnostic: Diagnostic): string => {
  if (!diagnostic.file) {
    return "";
  }
  const path = displayPath(diagnostic.file);
  if (!diagnostic.range) {
    return ` ${path}`;
  }
  return ` ${path}:${diagnostic.range.line}:${diagnostic.range.column}`;
};

const formatDiagnostic = (diagnostic: Diagnostic): string => {
  const location = formatLocation(diagnostic);
  const lines = [
    `${diagnostic.severity} ${diagnostic.ruleId}${location} — ${diagnostic.message}`,
  ];
  if (diagnostic.help) {
    lines.push(`  help: ${diagnostic.help}`);
  }
  return lines.join("\n");
};

export const formatHuman = (
  _command: AnalyzeMode,
  diagnostics: Diagnostic[]
): string => {
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  const blocks: string[] = [];

  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === "error") {
      errors += 1;
    } else if (diagnostic.severity === "warning") {
      warnings += 1;
    } else {
      infos += 1;
    }
    blocks.push(formatDiagnostic(diagnostic));
  }

  const summary = `summary: ${errors} errors, ${warnings} warnings, ${infos} infos`;
  if (blocks.length === 0) {
    return summary;
  }
  return `${blocks.join("\n")}\n${summary}`;
};
