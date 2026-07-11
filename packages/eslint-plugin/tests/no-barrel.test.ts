import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RuleTester } from "eslint";
import { noBarrel } from "../src/rules/no-barrel";

const fixtures = join(import.meta.dir, "fixtures");
const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

const barrel = join(fixtures, "barrel/src/features/widget/index.ts");
const publicFile = join(
  fixtures,
  "barrel/src/features/widget/public/widget.ts"
);
const consumer = join(fixtures, "barrel-import/src/features/consumer/page.tsx");

tester.run("no-barrel", noBarrel, {
  invalid: [
    {
      code: readFileSync(barrel, "utf8"),
      errors: [{ messageId: "barrel" }],
      filename: barrel,
    },
    {
      code: readFileSync(consumer, "utf8"),
      errors: [{ messageId: "barrelImport" }],
      filename: consumer,
      output: `import { Widget } from "@/features/widget/public/widget";

export const Consumer = () => Widget;
`,
    },
  ],
  valid: [
    {
      code: readFileSync(publicFile, "utf8"),
      filename: publicFile,
    },
  ],
});
