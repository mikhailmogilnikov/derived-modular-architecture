import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

const diagnosticsForRoot = (root: string) => {
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
    expect(hit?.help?.toLowerCase()).toContain("dma promote");
    expect(hit?.help).toContain("promo");
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

  test("pages composition root can mount features without promotion", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-pages-mount-"));
    mkdirSync(join(root, "src/pages"), { recursive: true });
    mkdirSync(join(root, "src/features"), { recursive: true });
    writeFileSync(
      join(root, "src/features/profile.tsx"),
      "export const Profile = () => null;\n"
    );
    writeFileSync(
      join(root, "src/pages/index.tsx"),
      'import { Profile } from "../features/profile";\nexport default Profile;\n'
    );

    const diagnostics = diagnosticsForRoot(root);
    expect(diagnostics.filter((d) => d.severity === "error")).toHaveLength(0);
  });

  test("feature importing pages is upward layer-direction", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-pages-upward-"));
    mkdirSync(join(root, "src/pages"), { recursive: true });
    mkdirSync(join(root, "src/features"), { recursive: true });
    writeFileSync(
      join(root, "src/pages/shell.tsx"),
      "export const Shell = () => null;\n"
    );
    writeFileSync(
      join(root, "src/features/profile.tsx"),
      'import { Shell } from "../pages/shell";\nexport const Profile = Shell;\n'
    );

    const diagnostics = diagnosticsForRoot(root);
    const hit = diagnostics.find((d) => d.ruleId === "layer-direction");
    expect(hit?.severity).toBe("error");
    expect(hit?.message).toContain("features");
    expect(hit?.message).toContain("app");
  });

  test("routes composition root follows same layer rules as app", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-routes-mount-"));
    mkdirSync(join(root, "src/routes"), { recursive: true });
    mkdirSync(join(root, "src/features/checkout/public"), { recursive: true });
    writeFileSync(
      join(root, "src/features/checkout/public/checkout-page.tsx"),
      "export const CheckoutPage = () => null;\n"
    );
    writeFileSync(
      join(root, "src/routes/checkout.tsx"),
      'import { CheckoutPage } from "../features/checkout/public/checkout-page";\nexport const Route = CheckoutPage;\n'
    );

    const diagnostics = diagnosticsForRoot(root);
    expect(diagnostics.filter((d) => d.severity === "error")).toHaveLength(0);
  });
});
