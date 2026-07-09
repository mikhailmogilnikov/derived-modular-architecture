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
  ruleId: string;
}

interface SarifRun {
  results: SarifResult[];
  tool: {
    driver: {
      name: string;
      rules: [];
    };
  };
}

interface SarifLog {
  $schema: string;
  runs: SarifRun[];
  version: "2.1.0";
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

const toLocations = (diagnostic: Diagnostic): SarifLocation[] | undefined => {
  if (!diagnostic.file) {
    return;
  }
  const physicalLocation: SarifPhysicalLocation = {
    artifactLocation: { uri: diagnostic.file },
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
  diagnostics: Diagnostic[]
): string => {
  const results: SarifResult[] = diagnostics.map((diagnostic) => {
    const result: SarifResult = {
      level: toSarifLevel(diagnostic.severity),
      message: { text: diagnostic.message },
      ruleId: diagnostic.ruleId,
    };
    const locations = toLocations(diagnostic);
    if (locations) {
      result.locations = locations;
    }
    return result;
  });

  const log: SarifLog = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        results,
        tool: {
          driver: {
            name: "dma",
            rules: [],
          },
        },
      },
    ],
    version: "2.1.0",
  };

  return JSON.stringify(log, null, 2);
};
