import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Bump `version` here together with `spec/rules.json` whenever check/doctor/lint
 * rule id sets change (add / remove / rename). Fingerprints are sorted id lists.
 */
const CATALOG_GATE = {
  check:
    "feature-has-inbound\nfeature-to-feature\nlayer-direction\nno-barrel\nno-cycle\npublic-api\nservice-no-inbound",
  doctor: "dense-services\norphan-public\nshared-candidate\nstage-growth",
  lint: "feature-to-feature\nlayer-direction\nno-barrel\npublic-api",
  version: 1,
} as const;

const RULE_ID_LITERAL_RE = /ruleId:\s*"([a-z0-9-]+)"/g;
const ESLINT_RULE_KEY_RE = /^\s+"([a-z0-9-]+)":\s+[A-Za-z]/gm;
const ESLINT_RULES_BLOCK_RE = /rules:\s*\{([\s\S]*?)\n\s*\},/;

const repoRoot = join(import.meta.dir, "../../../..");
const catalogPath = join(repoRoot, "spec/rules.json");
const schemaPath = join(repoRoot, "spec/rules.schema.json");

interface CatalogRule {
  doc: string;
  id: string;
  severity: string;
  surfaces: string[];
}

interface RulesCatalog {
  rules: CatalogRule[];
  version: number;
}

const byId = (a: string, b: string): number => a.localeCompare(b);

const fingerprint = (ids: Iterable<string>): string =>
  [...new Set(ids)].sort(byId).join("\n");

const extractRuleIdLiterals = (source: string): string[] => {
  const ids = new Set<string>();
  RULE_ID_LITERAL_RE.lastIndex = 0;
  let match = RULE_ID_LITERAL_RE.exec(source);
  while (match !== null) {
    if (match[1]) {
      ids.add(match[1]);
    }
    match = RULE_ID_LITERAL_RE.exec(source);
  }
  return [...ids].sort(byId);
};

const extractEslintRuleKeys = (source: string): string[] => {
  const rulesBlock = source.match(ESLINT_RULES_BLOCK_RE);
  if (!rulesBlock?.[1]) {
    return [];
  }
  const ids = new Set<string>();
  ESLINT_RULE_KEY_RE.lastIndex = 0;
  let match = ESLINT_RULE_KEY_RE.exec(rulesBlock[1]);
  while (match !== null) {
    if (match[1]) {
      ids.add(match[1]);
    }
    match = ESLINT_RULE_KEY_RE.exec(rulesBlock[1]);
  }
  return [...ids].sort(byId);
};

const idsForSurface = (catalog: RulesCatalog, surface: string): string[] =>
  catalog.rules
    .filter((rule) => rule.surfaces.includes(surface))
    .map((rule) => rule.id)
    .sort(byId);

describe("spec/rules.json catalog CI gate", () => {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as RulesCatalog;
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as {
    required?: string[];
  };

  const checkFromCli = extractRuleIdLiterals(
    readFileSync(join(repoRoot, "packages/cli/src/core/rules.ts"), "utf8")
  );
  const doctorFromCli = extractRuleIdLiterals(
    readFileSync(join(repoRoot, "packages/cli/src/core/signals.ts"), "utf8")
  );
  const lintFromEslint = extractEslintRuleKeys(
    readFileSync(join(repoRoot, "packages/eslint-plugin/src/index.ts"), "utf8")
  );

  test("catalog version matches gate lock (bump both when rule sets change)", () => {
    expect(catalog.version).toBe(CATALOG_GATE.version);
  });

  test("CLI check ruleIds match gate fingerprint", () => {
    expect(fingerprint(checkFromCli)).toBe(CATALOG_GATE.check);
  });

  test("CLI doctor ruleIds match gate fingerprint", () => {
    expect(fingerprint(doctorFromCli)).toBe(CATALOG_GATE.doctor);
  });

  test("ESLint lint ruleIds match gate fingerprint", () => {
    expect(fingerprint(lintFromEslint)).toBe(CATALOG_GATE.lint);
  });

  test("catalog check surface equals CLI check ruleIds", () => {
    expect(idsForSurface(catalog, "check")).toEqual(checkFromCli);
  });

  test("catalog doctor surface equals CLI doctor ruleIds", () => {
    expect(idsForSurface(catalog, "doctor")).toEqual(doctorFromCli);
  });

  test("catalog lint surface equals ESLint ruleIds", () => {
    expect(idsForSurface(catalog, "lint")).toEqual(lintFromEslint);
  });

  test("rule ids are unique", () => {
    const ids = catalog.rules.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("each rule has required fields and valid surfaces", () => {
    expect(schema.required).toEqual(["version", "rules"]);
    const allowed = new Set(["check", "doctor", "lint"]);
    const severities = new Set(["error", "warning", "info"]);
    for (const rule of catalog.rules) {
      expect(rule.id.length).toBeGreaterThan(0);
      expect(severities.has(rule.severity)).toBe(true);
      expect(rule.surfaces.length).toBeGreaterThan(0);
      expect(rule.doc.length).toBeGreaterThan(0);
      for (const surface of rule.surfaces) {
        expect(allowed.has(surface)).toBe(true);
      }
    }
  });

  test("doc targets resolve to existing spec chapters", () => {
    for (const rule of catalog.rules) {
      const [chapter] = rule.doc.split("#");
      expect(chapter).toBeTruthy();
      const chapterPath = join(repoRoot, "spec", chapter ?? "");
      expect(readFileSync(chapterPath, "utf8").length).toBeGreaterThan(0);
    }
  });
});
