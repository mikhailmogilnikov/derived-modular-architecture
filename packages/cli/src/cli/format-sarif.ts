import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { AnalyzeMode, Diagnostic, Severity } from "../core/types";

interface SarifMessage {
  text: string;
}

interface SarifPhysicalLocation {
  artifactLocation: { uri: string };
  region?: {
    endColumn?: number;
    endLine?: number;
    startColumn: number;
    startLine: number;
  };
}

interface SarifLocation {
  physicalLocation: SarifPhysicalLocation;
}

interface SarifResult {
  level: "error" | "warning" | "note";
  locations?: SarifLocation[];
  message: SarifMessage;
  properties?: { project: string };
  ruleId: string;
}

interface SarifRule {
  id: string;
}

interface SarifRun {
  results: SarifResult[];
  tool: {
    driver: {
      name: string;
      rules: SarifRule[];
    };
  };
}

interface SarifLog {
  $schema: string;
  runs: SarifRun[];
  version: "2.1.0";
}

export interface FormatSarifOptions {
  cwd?: string;
}

const toSarifLevel = (severity: Severity): SarifResult["level"] => {
  if (severity === "error") {
    return "error";
  }
  if (severity === "warning") {
    return "warning";
  }
  return "note";
};

const toArtifactUri = (file: string, cwd: string): string => {
  const absolute = isAbsolute(file) ? file : resolve(cwd, file);
  const rel = relative(cwd, absolute);
  if (rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)) {
    return rel.split("\\").join("/");
  }
  return pathToFileURL(absolute).href;
};

const toLocations = (
  diagnostic: Diagnostic,
  cwd: string
): SarifLocation[] | undefined => {
  if (!diagnostic.file) {
    return;
  }
  const physicalLocation: SarifPhysicalLocation = {
    artifactLocation: { uri: toArtifactUri(diagnostic.file, cwd) },
  };
  if (diagnostic.range) {
    physicalLocation.region = {
      endColumn: diagnostic.range.endColumn,
      endLine: diagnostic.range.endLine,
      startColumn: diagnostic.range.column,
      startLine: diagnostic.range.line,
    };
  }
  return [{ physicalLocation }];
};

export const formatSarif = (
  _command: AnalyzeMode,
  diagnostics: Diagnostic[],
  options?: FormatSarifOptions
): string => {
  const cwd = options?.cwd ?? process.cwd();
  const results: SarifResult[] = diagnostics.map((diagnostic) => {
    const result: SarifResult = {
      level: toSarifLevel(diagnostic.severity),
      message: { text: diagnostic.message },
      ruleId: diagnostic.ruleId,
    };
    if (diagnostic.project !== undefined) {
      result.properties = { project: diagnostic.project };
    }
    const locations = toLocations(diagnostic, cwd);
    if (locations) {
      result.locations = locations;
    }
    return result;
  });

  const ruleIds = [...new Set(diagnostics.map((d) => d.ruleId))];
  const log: SarifLog = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        results,
        tool: {
          driver: {
            name: "dma",
            rules: ruleIds.map((id) => ({ id })),
          },
        },
      },
    ],
    version: "2.1.0",
  };

  return JSON.stringify(log, null, 2);
};
