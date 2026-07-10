export type Severity = "error" | "warning" | "info";
export type AnalyzeMode = "check" | "doctor";

export interface DiagnosticRange {
  column: number;
  endColumn?: number;
  endLine?: number;
  line: number;
}

export interface Diagnostic {
  file?: string;
  help?: string;
  message: string;
  range?: DiagnosticRange;
  ruleId: string;
  severity: Severity;
}

export type Layer = "app" | "features" | "services" | "shared";

export interface ModuleRef {
  id: string;
  kind: "file" | "dir";
  layer: "features" | "services";
  name: string;
  rootPath: string;
  stage: 0 | 1 | 2;
}

export interface ImportSpec {
  column: number;
  fromFile: string;
  isTypeOnly: boolean;
  line: number;
  specifier: string;
}

export interface ResolvedEdge {
  column: number;
  fromFile: string;
  isTypeOnly: boolean;
  line: number;
  toFile: string;
}

export interface AnalyzeResult {
  diagnostics: Diagnostic[];
  srcRoot: string;
}
