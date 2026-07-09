import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { formatSarif } from "../../src/cli/format-sarif";
import type { Diagnostic } from "../../src/core/types";

describe("formatSarif", () => {
  test("emits cwd-relative artifact URIs and file:// outside cwd", () => {
    const cwd = "/project";
    const inside = join(cwd, "src", "app.tsx");
    const outside = "/other/lib.ts";
    const diagnostics: Diagnostic[] = [
      {
        file: inside,
        message: "inside",
        range: { column: 1, endColumn: 2, endLine: 1, line: 1 },
        ruleId: "dma/layer",
        severity: "error",
      },
      {
        file: outside,
        message: "outside",
        ruleId: "dma/layer",
        severity: "warning",
      },
    ];

    const log = JSON.parse(formatSarif("check", diagnostics, { cwd })) as {
      version: string;
      runs: Array<{
        results: Array<{
          locations: Array<{
            physicalLocation: { artifactLocation: { uri: string } };
          }>;
        }>;
        tool: { driver: { rules: Array<{ id: string }> } };
      }>;
    };

    const [run] = log.runs;
    expect(log.version).toBe("2.1.0");
    expect(
      run.results[0].locations[0].physicalLocation.artifactLocation.uri
    ).toBe("src/app.tsx");
    expect(
      run.results[1].locations[0].physicalLocation.artifactLocation.uri
    ).toBe(pathToFileURL(outside).href);
    expect(run.tool.driver.rules).toEqual([{ id: "dma/layer" }]);
  });
});
