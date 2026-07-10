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
    const hit = diagnostics.find((d) => d.ruleId === "layer-direction");
    expect(hit?.severity).toBe("error");
    expect(hit?.file).toBeTruthy();
    expect(hit?.help).toBeTruthy();
  });

  test("feature-to-feature", () => {
    const diagnostics = diagnosticsFor("feature-to-feature");
    const hit = diagnostics.find((d) => d.ruleId === "feature-to-feature");
    expect(hit?.severity).toBe("error");
    expect(hit?.file?.endsWith("a.tsx")).toBe(true);
    expect(hit?.range?.line).toBeGreaterThan(0);
  });

  test("public-api", () => {
    const diagnostics = diagnosticsFor("deep-import");
    const hit = diagnostics.find((d) => d.ruleId === "public-api");
    expect(hit?.severity).toBe("error");
    expect(hit?.message.toLowerCase()).toContain("public");
  });

  test("no-barrel", () => {
    const diagnostics = diagnosticsFor("barrel");
    const hit = diagnostics.find((d) => d.ruleId === "no-barrel");
    expect(hit?.severity).toBe("error");
    expect(hit?.file?.endsWith("index.ts")).toBe(true);
  });

  test("no-cycle", () => {
    const diagnostics = diagnosticsFor("cycle");
    const hit = diagnostics.find((d) => d.ruleId === "no-cycle");
    expect(hit?.severity).toBe("error");
    expect(hit?.message.toLowerCase()).toContain("circular");
  });

  test("feature-has-inbound", () => {
    const diagnostics = diagnosticsFor("inbound-feature");
    const hit = diagnostics.find((d) => d.ruleId === "feature-has-inbound");
    expect(hit?.severity).toBe("error");
    expect(hit?.help?.toLowerCase()).toContain("services");
  });

  test("service-no-inbound", () => {
    const diagnostics = diagnosticsFor("service-no-inbound");
    const hit = diagnostics.find((d) => d.ruleId === "service-no-inbound");
    expect(hit?.severity).toBe("error");
    expect(hit?.message.toLowerCase()).toContain("inbound");
  });

  test("clean fixture has no hard errors", () => {
    const diagnostics = diagnosticsFor("clean");
    expect(diagnostics.filter((d) => d.severity === "error")).toHaveLength(0);
  });
});
