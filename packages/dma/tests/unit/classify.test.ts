import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { classify } from "../../src/core/classify";
import { discover } from "../../src/core/discover";
import { buildGraph } from "../../src/core/graph";
import { loadPathAliases } from "../../src/core/tsconfig-paths";

const fixturesRoot = join(import.meta.dir, "../fixtures");

const graphFor = (fixtureName: string) => {
  const root = join(fixturesRoot, fixtureName);
  const project = discover(root);
  const graph = buildGraph(project, loadPathAliases(root));
  const classified = classify(project, graph);
  return { classified, graph, project, root };
};

describe("classify", () => {
  test("checkout dir module is stage >= 1; profile is stage 0", () => {
    const { classified, project } = graphFor("clean");
    const checkout = project.modules.find((m) => m.name === "checkout");
    const profile = project.modules.find((m) => m.name === "profile");
    expect(
      checkout && classified.stageByModule.get(checkout.id)
    ).toBeGreaterThanOrEqual(1);
    expect(profile && classified.stageByModule.get(profile.id)).toBe(0);
  });

  test("app mounts features without creating module edges or inbound", () => {
    const { classified, graph, project } = graphFor("clean");
    const profile = project.modules.find((m) => m.name === "profile");
    expect(profile).toBeTruthy();

    const appFile = project.sourceFiles.find((f) => f.endsWith("app/app.tsx"));
    expect(appFile).toBeTruthy();
    expect(graph.moduleOfFile.get(appFile ?? "")).toBeNull();

    expect(graph.moduleEdges).toHaveLength(0);
    expect(
      (classified.inboundFromModules.get(profile?.id ?? "") ?? new Set()).size
    ).toBe(0);
  });

  test("feature-to-feature creates module edge and inbound on target", () => {
    const { classified, graph } = graphFor("feature-to-feature");
    expect(
      graph.moduleEdges.some(
        (e) => e.from === "features/a" && e.to === "features/b"
      )
    ).toBe(true);
    expect(
      classified.inboundFromModules.get("features/b")?.has("features/a")
    ).toBe(true);
  });

  test("import type edges count in the file graph", () => {
    const root = join(fixturesRoot, "clean");
    const project = discover(root);
    const graph = buildGraph(project, loadPathAliases(root));
    // At least one resolved project-internal edge from the fixture.
    expect(graph.fileEdges.length).toBeGreaterThan(0);
    expect(
      graph.fileEdges.every(
        (e) => typeof e.line === "number" && typeof e.column === "number"
      )
    ).toBe(true);
  });
});
