import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RuleTester } from "eslint";
import { layerDirection } from "../src/rules/layer-direction";

const fixtures = join(import.meta.dir, "fixtures");
const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

const downward = join(fixtures, "layer/src/features/profile.tsx");
const upward = join(fixtures, "layer/src/features/upward.tsx");
const pagesMount = join(fixtures, "clean/src/pages/index.tsx");

tester.run("layer-direction", layerDirection, {
  invalid: [
    {
      code: readFileSync(upward, "utf8"),
      errors: [{ messageId: "upward" }],
      filename: upward,
    },
  ],
  valid: [
    {
      code: readFileSync(downward, "utf8"),
      filename: downward,
    },
    {
      code: readFileSync(pagesMount, "utf8"),
      filename: pagesMount,
    },
  ],
});
