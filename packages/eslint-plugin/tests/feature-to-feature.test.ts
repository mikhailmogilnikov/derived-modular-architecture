import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RuleTester } from "eslint";
import { featureToFeature } from "../src/rules/feature-to-feature";

const fixtures = join(import.meta.dir, "fixtures");
const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

const bad = join(fixtures, "ftf/src/features/b.tsx");
const ok = join(fixtures, "ftf/src/features/a.tsx");

tester.run("feature-to-feature", featureToFeature, {
  invalid: [
    {
      code: readFileSync(bad, "utf8"),
      errors: [{ messageId: "featureToFeature" }],
      filename: bad,
    },
  ],
  valid: [
    {
      code: readFileSync(ok, "utf8"),
      filename: ok,
    },
  ],
});
