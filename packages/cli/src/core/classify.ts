import { readdirSync } from "node:fs";
import type { DiscoveredProject } from "./discover";
import type { ProjectGraph } from "./graph";

const SEGMENT_DIRS = new Set(["ui", "model", "api"]);

export interface ClassifiedProject {
  inboundFromModules: Map<string, Set<string>>;
  stageByModule: Map<string, 0 | 1 | 2>;
}

const dirHasSegment = (modulePath: string): boolean => {
  const entries = readdirSync(modulePath, { withFileTypes: true });
  return entries.some(
    (entry) => entry.isDirectory() && SEGMENT_DIRS.has(entry.name)
  );
};

export const classify = (
  project: DiscoveredProject,
  graph: ProjectGraph
): ClassifiedProject => {
  const inboundFromModules = new Map<string, Set<string>>();

  for (const edge of graph.moduleEdges) {
    let sources = inboundFromModules.get(edge.to);
    if (!sources) {
      sources = new Set();
      inboundFromModules.set(edge.to, sources);
    }
    sources.add(edge.from);
  }

  const stageByModule = new Map<string, 0 | 1 | 2>();
  for (const mod of project.modules) {
    if (mod.kind === "file") {
      stageByModule.set(mod.id, 0);
      continue;
    }
    stageByModule.set(mod.id, dirHasSegment(mod.rootPath) ? 2 : 1);
  }

  return { inboundFromModules, stageByModule };
};
