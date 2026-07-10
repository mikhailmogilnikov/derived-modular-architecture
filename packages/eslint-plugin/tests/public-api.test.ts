import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RuleTester } from "eslint";
import { publicApi } from "../src/rules/public-api";

const fixtures = join(import.meta.dir, "fixtures");
const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

const deep = join(fixtures, "deep/src/features/b/b.tsx");
const ok = join(fixtures, "deep/src/features/b/ok.tsx");

tester.run("public-api", publicApi, {
  invalid: [
    {
      code: readFileSync(deep, "utf8"),
      errors: [{ messageId: "deep" }],
      filename: deep,
    },
  ],
  valid: [
    {
      code: readFileSync(ok, "utf8"),
      filename: ok,
    },
  ],
});
