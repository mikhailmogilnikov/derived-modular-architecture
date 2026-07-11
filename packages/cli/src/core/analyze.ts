import { classify } from "./classify";
import type { DiscoverOptions } from "./discover";
import { discover } from "./discover";
import { buildGraph } from "./graph";
import { runCheckRules } from "./rules";
import { runDoctorSignals } from "./signals";
import { loadPathAliases } from "./tsconfig-paths";
import type { AnalyzeMode, AnalyzeResult } from "./types";

export type AnalyzeOptions = DiscoverOptions;

export const analyze = (
  projectRoot: string,
  mode: AnalyzeMode,
  options?: AnalyzeOptions
): AnalyzeResult => {
  const project = discover(projectRoot, options);
  const aliases = loadPathAliases(project.projectRoot);
  const graph = buildGraph(project, aliases);
  const classified = classify(project, graph);
  const diagnostics =
    mode === "check"
      ? runCheckRules(project, graph, classified)
      : runDoctorSignals(project, graph, classified);

  return {
    diagnostics,
    srcRoot: project.srcRoot,
  };
};
