import { relative } from "node:path";
import type { AnalyzeMode, Diagnostic, Severity } from "../core/types";

export interface FormatHumanOptions {
  projects?: string[];
}

const ESC = "\u001B[";
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;
const RED = `${ESC}31m`;
const GREEN = `${ESC}32m`;
const YELLOW = `${ESC}33m`;
const BLUE = `${ESC}34m`;
const CYAN = `${ESC}36m`;
const GRAY = `${ESC}90m`;

const useColor = (): boolean => {
  if (process.env.NO_COLOR !== undefined) {
    return false;
  }
  if (process.env.FORCE_COLOR !== undefined) {
    return true;
  }
  return Boolean(process.stdout.isTTY);
};

const paint = (enabled: boolean, code: string, text: string): string =>
  enabled ? `${code}${text}${RESET}` : text;

const severityStyle = (
  severity: Severity
): { color: string; label: string } => {
  if (severity === "error") {
    return { color: RED, label: "error" };
  }
  if (severity === "warning") {
    return { color: YELLOW, label: "warn" };
  }
  return { color: BLUE, label: "info" };
};

const displayPath = (file: string): string => {
  const rel = relative(process.cwd(), file);
  return rel === "" ? file : rel;
};

const formatLocation = (diagnostic: Diagnostic, color: boolean): string => {
  if (!diagnostic.file) {
    return "";
  }
  const path = displayPath(diagnostic.file);
  if (!diagnostic.range) {
    return paint(color, CYAN, path);
  }
  const loc = `${path}:${diagnostic.range.line}:${diagnostic.range.column}`;
  return paint(color, CYAN, loc);
};

const FEATURE_INBOUND_NAME_RE = /Feature "([^"]+)" has inbound/;
const FEATURE_IMPORT_TARGET_RE = /imports feature "([^"]+)"/;

const CHECK_FIXABLE_RULES = new Set(["no-barrel", "public-api"]);
const DOCTOR_FIXABLE_RULES = new Set(["orphan-public"]);

const formatPromoteTip = (
  diagnostics: Diagnostic[],
  color: boolean
): string | null => {
  const names = new Set<string>();
  for (const diagnostic of diagnostics) {
    if (diagnostic.ruleId === "feature-has-inbound") {
      const match = FEATURE_INBOUND_NAME_RE.exec(diagnostic.message);
      if (match?.[1]) {
        names.add(match[1]);
      }
      continue;
    }
    if (diagnostic.ruleId === "feature-to-feature") {
      const match = FEATURE_IMPORT_TARGET_RE.exec(diagnostic.message);
      if (match?.[1]) {
        names.add(match[1]);
      }
    }
  }
  if (names.size === 0) {
    return null;
  }
  const commands = [...names]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `npx @derived-modular/cli promote ${name}`)
    .join(" · ");
  return paint(
    color,
    DIM,
    `tip  Auto-promote (dry-run first): ${commands}  ·  then add --apply`
  );
};

const formatFixTip = (
  command: AnalyzeMode,
  diagnostics: Diagnostic[],
  color: boolean
): string | null => {
  const fixable =
    command === "check" ? CHECK_FIXABLE_RULES : DOCTOR_FIXABLE_RULES;
  const hasFixable = diagnostics.some((diagnostic) =>
    fixable.has(diagnostic.ruleId)
  );
  if (!hasFixable) {
    return null;
  }
  return paint(
    color,
    DIM,
    `tip  Safe fixes: npx @derived-modular/cli ${command} --suggest  ·  then --fix`
  );
};

const appendTips = (body: string, tips: (string | null)[]): string => {
  const present = tips.filter((tip): tip is string => tip !== null);
  if (present.length === 0) {
    return body;
  }
  return `${body}\n${present.join("\n")}`;
};

const formatDiagnostic = (diagnostic: Diagnostic, color: boolean): string => {
  const { color: sevColor, label } = severityStyle(diagnostic.severity);
  const severity = paint(color, `${BOLD}${sevColor}`, label);
  const rule = paint(color, GRAY, diagnostic.ruleId);
  const location = formatLocation(diagnostic, color);
  const header = location
    ? `${severity} ${rule}  ${location}`
    : `${severity} ${rule}`;

  const lines = [header, `  ${diagnostic.message}`];
  if (diagnostic.help) {
    lines.push(paint(color, DIM, `  → ${diagnostic.help}`));
  }
  return lines.join("\n");
};

const countBySeverity = (
  diagnostics: Diagnostic[]
): { errors: number; infos: number; warnings: number } => {
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

const formatSummary = (
  command: AnalyzeMode,
  errors: number,
  warnings: number,
  infos: number,
  color: boolean
): string => {
  if (errors === 0 && warnings === 0 && infos === 0) {
    const ok = paint(color, `${BOLD}${GREEN}`, "✔");
    const verb = command === "check" ? "check passed" : "doctor found nothing";
    return `${ok} ${verb}`;
  }

  const parts: string[] = [];
  if (errors > 0) {
    parts.push(paint(color, RED, `${errors} error${errors === 1 ? "" : "s"}`));
  }
  if (warnings > 0) {
    parts.push(
      paint(color, YELLOW, `${warnings} warning${warnings === 1 ? "" : "s"}`)
    );
  }
  if (infos > 0) {
    parts.push(paint(color, BLUE, `${infos} info${infos === 1 ? "" : "s"}`));
  }

  const mark =
    errors > 0
      ? paint(color, `${BOLD}${RED}`, "✖")
      : paint(color, `${BOLD}${YELLOW}`, "⚠");
  return `${mark} ${parts.join(", ")}`;
};

const formatMultiFooter = (
  projectCount: number,
  errors: number,
  warnings: number,
  infos: number,
  color: boolean
): string => {
  const parts = [
    `${projectCount} root${projectCount === 1 ? "" : "s"}`,
    paint(color, RED, `${errors} error${errors === 1 ? "" : "s"}`),
  ];
  if (warnings > 0) {
    parts.push(
      paint(color, YELLOW, `${warnings} warning${warnings === 1 ? "" : "s"}`)
    );
  }
  if (infos > 0) {
    parts.push(paint(color, BLUE, `${infos} info${infos === 1 ? "" : "s"}`));
  }
  return parts.join(" · ");
};

const severityRank = (severity: Severity): number => {
  if (severity === "error") {
    return 0;
  }
  if (severity === "warning") {
    return 1;
  }
  return 2;
};

const orderDiagnostics = (diagnostics: Diagnostic[]): Diagnostic[] =>
  [...diagnostics].sort((a, b) => {
    const bySeverity = severityRank(a.severity) - severityRank(b.severity);
    if (bySeverity !== 0) {
      return bySeverity;
    }
    const fileA = a.file ?? "";
    const fileB = b.file ?? "";
    if (fileA !== fileB) {
      return fileA.localeCompare(fileB);
    }
    return a.ruleId.localeCompare(b.ruleId);
  });

const formatSingle = (
  command: AnalyzeMode,
  diagnostics: Diagnostic[],
  color: boolean
): string => {
  const { errors, infos, warnings } = countBySeverity(diagnostics);
  const summary = formatSummary(command, errors, warnings, infos, color);

  if (diagnostics.length === 0) {
    return summary;
  }

  const blocks = orderDiagnostics(diagnostics).map((diagnostic) =>
    formatDiagnostic(diagnostic, color)
  );
  const body = `${blocks.join("\n\n")}\n\n${summary}`;
  return appendTips(body, [
    formatPromoteTip(diagnostics, color),
    formatFixTip(command, diagnostics, color),
  ]);
};

const formatMulti = (
  command: AnalyzeMode,
  diagnostics: Diagnostic[],
  projects: string[],
  color: boolean
): string => {
  const { errors, infos, warnings } = countBySeverity(diagnostics);
  const header = `Checking ${projects.length} roots…`;
  const sections: string[] = [];

  for (const project of projects) {
    const projectDiagnostics = diagnostics.filter(
      (diagnostic) => diagnostic.project === project
    );
    const banner = `── ${project} ──`;
    if (projectDiagnostics.length === 0) {
      sections.push(`${banner}\nok`);
      continue;
    }
    const blocks = orderDiagnostics(projectDiagnostics).map((diagnostic) =>
      formatDiagnostic(diagnostic, color)
    );
    sections.push(`${banner}\n${blocks.join("\n\n")}`);
  }

  const footer = formatMultiFooter(
    projects.length,
    errors,
    warnings,
    infos,
    color
  );
  const body = `${header}\n${sections.join("\n")}\n${footer}`;
  return appendTips(body, [
    formatPromoteTip(diagnostics, color),
    formatFixTip(command, diagnostics, color),
  ]);
};

export const formatHuman = (
  command: AnalyzeMode,
  diagnostics: Diagnostic[],
  options?: FormatHumanOptions
): string => {
  const color = useColor();
  const projects = options?.projects;
  if (projects !== undefined && projects.length > 1) {
    return formatMulti(command, diagnostics, projects, color);
  }
  return formatSingle(command, diagnostics, color);
};
