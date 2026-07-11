import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { classify } from "../../src/core/classify";
import { discover } from "../../src/core/discover";
import { buildGraph } from "../../src/core/graph";
import { runDoctorSignals } from "../../src/core/signals";
import { loadPathAliases } from "../../src/core/tsconfig-paths";

const fixturesRoot = join(import.meta.dir, "../fixtures");

const doctorFor = (fixtureName: string) => {
  const root = join(fixturesRoot, fixtureName);
  const project = discover(root);
  const graph = buildGraph(project, loadPathAliases(root));
  const classified = classify(project, graph);
  return {
    classified,
    diagnostics: runDoctorSignals(project, graph, classified),
    graph,
    project,
    root,
  };
};

describe("runDoctorSignals", () => {
  test("shared-candidate points at shared file with severity warning", () => {
    const { diagnostics, root } = doctorFor("shared-candidate");
    const hit = diagnostics.find((d) => d.ruleId === "shared-candidate");
    expect(hit?.severity).toBe("warning");
    expect(hit?.file?.endsWith("format-date.ts")).toBe(true);
    expect(hit?.file?.startsWith(root)).toBe(true);
    expect(hit?.help).toBe(
      "Placement #2–3: second use — keep in services/ if product flow, else extract to shared/{ui,lib,api,model,domain}. Don't extract on first use."
    );
  });

  test("orphan-public is info and includes dead public file", () => {
    const { diagnostics } = doctorFor("shared-candidate");
    const orphans = diagnostics.filter((d) => d.ruleId === "orphan-public");
    expect(orphans.length).toBeGreaterThan(0);
    expect(orphans.every((d) => d.severity === "info")).toBe(true);
    expect(orphans.some((d) => d.file?.endsWith("dead.ts"))).toBe(true);
  });

  test("stage-growth warns for stage-0 sibling prefix files", () => {
    const { diagnostics } = doctorFor("stage-growth-0");
    const hits = diagnostics.filter((d) => d.ruleId === "stage-growth");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((d) => d.severity === "warning")).toBe(true);
    expect(
      hits.every((d) =>
        d.help?.startsWith("Placement #4–5: related siblings share a basename")
      )
    ).toBe(true);
    expect(
      hits.some(
        (d) =>
          d.message.includes("Stage-0") &&
          (d.file?.endsWith("checkout.tsx") ||
            d.file?.endsWith("checkout.store.ts"))
      )
    ).toBe(true);
  });

  test("stage-growth warns for stage-1 mixed ui/model filenames", () => {
    const { diagnostics, classified, project } = doctorFor("stage-growth-1");
    const widget = project.modules.find((m) => m.name === "widget");
    expect(widget).toBeTruthy();
    expect(classified.stageByModule.get(widget?.id ?? "")).toBe(1);

    const hit = diagnostics.find((d) => d.ruleId === "stage-growth");
    expect(hit?.severity).toBe("warning");
    expect(hit?.message).toContain("Stage-1");
    expect(hit?.message).toContain("widget");
    expect(hit?.help).toBe(
      "Placement #4: module is large enough — introduce ui/model/api segments and keep sole-consumer code colocated."
    );
  });

  test("dense-services warns on long services dependency path", () => {
    const { diagnostics, graph } = doctorFor("dense-services");
    expect(graph.moduleEdges.length).toBeGreaterThanOrEqual(4);

    const hit = diagnostics.find((d) => d.ruleId === "dense-services");
    expect(hit?.severity).toBe("warning");
    expect(hit?.message).toContain("longest path 4");
    expect(hit?.help).toContain("horizontal split");
  });

  test("doctor does not emit check ruleIds", () => {
    const checkRuleIds = new Set([
      "layer-direction",
      "feature-to-feature",
      "public-api",
      "no-barrel",
      "no-cycle",
      "feature-has-inbound",
      "service-no-inbound",
    ]);
    for (const name of [
      "shared-candidate",
      "stage-growth-0",
      "stage-growth-1",
      "dense-services",
      "feature-to-feature",
    ]) {
      const { diagnostics } = doctorFor(name);
      expect(diagnostics.every((d) => !checkRuleIds.has(d.ruleId))).toBe(true);
    }
  });
});
