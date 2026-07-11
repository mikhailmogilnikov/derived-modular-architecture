import { describe, expect, test } from "bun:test";
import { formatJson } from "../../src/cli/format-json";
import type { Diagnostic } from "../../src/core/types";

describe("formatJson", () => {
  test("summary counts errors, warnings, and infos", () => {
    const diagnostics: Diagnostic[] = [
      { message: "e1", ruleId: "a", severity: "error" },
      { message: "e2", ruleId: "b", severity: "error" },
      { message: "w1", ruleId: "c", severity: "warning" },
      { message: "i1", ruleId: "d", severity: "info" },
      { message: "i2", ruleId: "e", severity: "info" },
      { message: "i3", ruleId: "f", severity: "info" },
    ];

    const report = JSON.parse(formatJson("check", diagnostics)) as {
      version: number;
      command: string;
      diagnostics: Diagnostic[];
      summary: { errors: number; warnings: number; infos: number };
    };

    expect(report.version).toBe(1);
    expect(report.command).toBe("check");
    expect(report.diagnostics).toHaveLength(6);
    expect(report.summary).toEqual({ errors: 2, infos: 3, warnings: 1 });
  });

  test("includes projects when multi", () => {
    const report = JSON.parse(
      formatJson(
        "check",
        [{ message: "e", project: "apps/a", ruleId: "x", severity: "error" }],
        { projects: ["apps/a", "apps/b"] }
      )
    ) as { projects?: string[]; diagnostics: Diagnostic[] };

    expect(report.projects).toEqual(["apps/a", "apps/b"]);
    expect(report.diagnostics[0]?.project).toBe("apps/a");
  });
});
