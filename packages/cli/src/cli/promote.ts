import { relative } from "node:path";
import { loadConfig } from "../core/load-config";
import { mergeOptions } from "./merge-options";
import type { CliArgs } from "./parse-args";
import { applyPromote } from "./promote-apply";
import { buildPromotePlan, formatPromotePlan } from "./promote-plan";

export const runPromote = async (args: CliArgs): Promise<number> => {
  if (!args.module) {
    throw new Error("promote requires a module name.");
  }

  const loaded = await loadConfig(args.path, args.config);
  const options = mergeOptions(args, loaded);
  const plan = buildPromotePlan(args.path, args.module, options);

  process.stdout.write(formatPromotePlan(plan, args.apply));

  if (!args.apply) {
    return 0;
  }

  const result = applyPromote(plan, options);
  const moved = relative(plan.projectRoot, plan.newRoot).split("\\").join("/");
  process.stdout.write(
    `\nApplied: moved to ${moved}; rewrote ${result.rewritten} import(s); post-check ok.\n`
  );
  return 0;
};
