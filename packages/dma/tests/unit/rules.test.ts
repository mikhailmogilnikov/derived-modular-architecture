import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { classify } from "../../src/core/classify";
import { discover } from "../../src/core/discover";
import { buildGraph } from "../../src/core/graph";
import { runCheckRules } from "../../src/core/rules";
import { loadPathAliases } from "../../src/core/tsconfig-paths";

const fixturesRoot = join(import.meta.dir, "../fixtures");

const diagnosticsFor = (fixtureName: string) => {
  const root = join(fixturesRoot, fixtureName);
  const project = discover(root);
  const graph = buildGraph(project, loadPathAliases(root));
  const classified = classify(project, graph);
  return runCheckRules(project, graph, classified);
};

describe("runCheckRules", () => {
  test("layer-direction", () => {
    const diagnostics = diagnosticsFor("layer-violation");
    expect(diagnostics.some((d) => d.ruleId === "layer-direction")).toBe(true);
  });

  test("feature-to-feature", () => {
    const diagnostics = diagnosticsFor("feature-to-feature");
    expect(diagnostics.some((d) => d.ruleId === "feature-to-feature")).toBe(
      true
    );
  });

  test("public-api", () => {
    const diagnostics = diagnosticsFor("deep-import");
    expect(diagnostics.some((d) => d.ruleId === "public-api")).toBe(true);
  });

  test("no-barrel", () => {
    const diagnostics = diagnosticsFor("barrel");
    expect(diagnostics.some((d) => d.ruleId === "no-barrel")).toBe(true);
  });

  test("no-cycle", () => {
    const diagnostics = diagnosticsFor("cycle");
    expect(diagnostics.some((d) => d.ruleId === "no-cycle")).toBe(true);
  });

  test("feature-has-inbound", () => {
    const diagnostics = diagnosticsFor("inbound-feature");
    expect(diagnostics.some((d) => d.ruleId === "feature-has-inbound")).toBe(
      true
    );
  });

  test("service-no-inbound", () => {
    const diagnostics = diagnosticsFor("service-no-inbound");
    expect(diagnostics.some((d) => d.ruleId === "service-no-inbound")).toBe(
      true
    );
  });
});
