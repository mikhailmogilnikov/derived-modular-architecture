import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { classify } from "../../src/core/classify";
import { discover } from "../../src/core/discover";
import { buildGraph } from "../../src/core/graph";
import { runDoctorSignals } from "../../src/core/signals";
import { loadPathAliases } from "../../src/core/tsconfig-paths";

const fixturesRoot = join(import.meta.dir, "../fixtures");

const diagnosticsFor = (fixtureName: string) => {
  const root = join(fixturesRoot, fixtureName);
  const project = discover(root);
  const graph = buildGraph(project, loadPathAliases(root));
  const classified = classify(project, graph);
  return runDoctorSignals(project, graph, classified);
};

describe("runDoctorSignals", () => {
  test("shared-candidate", () => {
    const diagnostics = diagnosticsFor("shared-candidate");
    expect(diagnostics.some((d) => d.ruleId === "shared-candidate")).toBe(true);
  });

  test("orphan-public", () => {
    const diagnostics = diagnosticsFor("shared-candidate");
    expect(diagnostics.some((d) => d.ruleId === "orphan-public")).toBe(true);
  });
});
