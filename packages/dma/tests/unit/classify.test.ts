import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { classify } from "../../src/core/classify";
import { discover } from "../../src/core/discover";
import { buildGraph } from "../../src/core/graph";
import { loadPathAliases } from "../../src/core/tsconfig-paths";

const fixture = join(import.meta.dir, "../fixtures/clean");

describe("classify", () => {
  test("checkout dir module is stage >= 1; profile is stage 0", () => {
    const project = discover(fixture);
    const graph = buildGraph(project, loadPathAliases(fixture));
    const c = classify(project, graph);
    const checkout = project.modules.find((m) => m.name === "checkout");
    const profile = project.modules.find((m) => m.name === "profile");
    expect(checkout && c.stageByModule.get(checkout.id)).toBeGreaterThanOrEqual(
      1
    );
    expect(profile && c.stageByModule.get(profile.id)).toBe(0);
  });
});
