import { basename, dirname, extname, join, relative, sep } from "node:path";
import type { ClassifiedProject } from "./classify";
import type { DiscoveredProject } from "./discover";
import type { ProjectGraph } from "./graph";
import { isSourceFileName } from "./source-files";
import { DEFAULT_THRESHOLDS, type Thresholds } from "./thresholds";
import type { Diagnostic, ModuleRef } from "./types";

const SEGMENT_NAMES = ["ui", "model", "api"] as const;
const SEGMENT_DIR_SET = new Set<string>(SEGMENT_NAMES);

type PlacementLayer = "features" | "services" | "shared" | "unknown";

const HELP_SHARED_CANDIDATE_FEATURES =
  "Placement #2: another module imports this — promote the feature with `dma promote <name>` (dry-run) then `--apply` (folder + public/ only). Never feature→feature.";
const HELP_SHARED_CANDIDATE_SERVICES =
  "Placement #2–3: second use — keep in services/ if product flow, else extract to shared/{ui,lib,api,model,domain}. Don't extract on first use.";
const HELP_SHARED_CANDIDATE_SHARED =
  "Placement #3: already under shared/ — check that the helper stays portable and coupling stays intentional.";
const HELP_SHARED_CANDIDATE_UNKNOWN =
  "Placement #2–3: imported by 2+ modules — `dma promote <name>` if this is a folder feature, else services/<name>/public/ or shared/ if portable.";
const HELP_STAGE_GROWTH_0 =
  "Placement #4–5: related siblings share a basename — promote to features/<name>/ (or services/) with public/; colocate internals inside the module.";
const HELP_STAGE_GROWTH_1 =
  "Placement #4: module is large enough — introduce ui/model/api segments and keep sole-consumer code colocated.";

interface SignalContext {
  classified: ClassifiedProject;
  graph: ProjectGraph;
  project: DiscoveredProject;
  thresholds: Thresholds;
}

const placementLayerForFile = (
  filePath: string,
  ctx: SignalContext
): PlacementLayer => {
  const moduleId = ctx.graph.moduleOfFile.get(filePath) ?? null;
  if (moduleId !== null) {
    const mod = ctx.project.modules.find((entry) => entry.id === moduleId);
    if (mod?.layer === "features" || mod?.layer === "services") {
      return mod.layer;
    }
  }

  const sharedDir = ctx.project.layers.shared;
  if (sharedDir && isUnderDir(filePath, sharedDir)) {
    return "shared";
  }

  const [top] = relative(ctx.project.srcRoot, filePath).split(sep);
  if (top === "shared") {
    return "shared";
  }

  return "unknown";
};

const helpForSharedCandidate = (layer: PlacementLayer): string => {
  switch (layer) {
    case "features":
      return HELP_SHARED_CANDIDATE_FEATURES;
    case "services":
      return HELP_SHARED_CANDIDATE_SERVICES;
    case "shared":
      return HELP_SHARED_CANDIDATE_SHARED;
    default:
      return HELP_SHARED_CANDIDATE_UNKNOWN;
  }
};

const isUnderDir = (filePath: string, dirPath: string): boolean => {
  const rel = relative(dirPath, filePath);
  return rel !== "" && !rel.startsWith(`..${sep}`) && !rel.startsWith("..");
};

const basenamePrefix = (filename: string): string => {
  const base = basename(filename, extname(filename));
  const dot = base.indexOf(".");
  return dot === -1 ? base : base.slice(0, dot);
};

const moduleSourceFiles = (
  mod: ModuleRef,
  project: DiscoveredProject
): string[] => {
  if (mod.kind === "file") {
    return [mod.rootPath];
  }
  return project.sourceFiles.filter((file) => isUnderDir(file, mod.rootPath));
};

const checkSharedCandidate = (ctx: SignalContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  const consumersByFile = new Map<string, Set<string>>();

  for (const edge of ctx.graph.fileEdges) {
    const toModule = ctx.graph.moduleOfFile.get(edge.toFile) ?? null;
    const fromModule = ctx.graph.moduleOfFile.get(edge.fromFile) ?? null;
    if (toModule === null || fromModule === null || fromModule === toModule) {
      continue;
    }
    let consumers = consumersByFile.get(edge.toFile);
    if (!consumers) {
      consumers = new Set();
      consumersByFile.set(edge.toFile, consumers);
    }
    consumers.add(fromModule);
  }

  for (const [filePath, consumers] of consumersByFile) {
    if (consumers.size < ctx.thresholds.sharedCandidateConsumers) {
      continue;
    }
    out.push({
      file: filePath,
      help: helpForSharedCandidate(placementLayerForFile(filePath, ctx)),
      message: `File is imported by ${consumers.size} other modules`,
      ruleId: "shared-candidate",
      severity: "warning",
    });
  }
  return out;
};

const hasStage0SiblingPrefix = (
  mod: ModuleRef,
  project: DiscoveredProject
): boolean => {
  const layerDir = dirname(mod.rootPath);
  const prefix = basenamePrefix(mod.rootPath);
  return project.sourceFiles.some((file) => {
    if (file === mod.rootPath) {
      return false;
    }
    if (dirname(file) !== layerDir) {
      return false;
    }
    if (!isSourceFileName(basename(file))) {
      return false;
    }
    return basenamePrefix(file) === prefix;
  });
};

const stage1NeedsSegments = (
  mod: ModuleRef,
  files: string[],
  thresholds: Thresholds
): boolean => {
  if (files.length >= thresholds.stage1FileCount) {
    return true;
  }

  const present = new Set<(typeof SEGMENT_NAMES)[number]>();
  for (const file of files) {
    const rel = relative(mod.rootPath, file);
    const parts = rel.split(sep);
    for (const part of parts.slice(0, -1)) {
      if (SEGMENT_DIR_SET.has(part)) {
        present.add(part as (typeof SEGMENT_NAMES)[number]);
      }
    }
    const name = basename(file);
    for (const segment of SEGMENT_NAMES) {
      if (name.startsWith(`${segment}.`)) {
        present.add(segment);
      }
    }
  }

  if (present.size < 2) {
    return false;
  }

  // Stage-1 modules lack top-level segment directories by classification.
  return true;
};

const checkStageGrowth = (ctx: SignalContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const mod of ctx.project.modules) {
    const stage = ctx.classified.stageByModule.get(mod.id) ?? mod.stage;
    if (stage === 0 && mod.kind === "file") {
      if (!hasStage0SiblingPrefix(mod, ctx.project)) {
        continue;
      }
      out.push({
        file: mod.rootPath,
        help: HELP_STAGE_GROWTH_0,
        message: `Stage-0 module "${mod.id}" has related sibling files`,
        ruleId: "stage-growth",
        severity: "warning",
      });
      continue;
    }
    if (stage !== 1 || mod.kind !== "dir") {
      continue;
    }
    const files = moduleSourceFiles(mod, ctx.project);
    if (!stage1NeedsSegments(mod, files, ctx.thresholds)) {
      continue;
    }
    out.push({
      file: mod.rootPath,
      help: HELP_STAGE_GROWTH_1,
      message: `Stage-1 module "${mod.id}" warrants segment structure`,
      ruleId: "stage-growth",
      severity: "warning",
    });
  }
  return out;
};

const servicesLongestPath = (
  serviceIds: string[],
  edges: { from: string; to: string }[]
): number => {
  const idSet = new Set(serviceIds);
  const adj = new Map<string, string[]>();
  for (const id of serviceIds) {
    adj.set(id, []);
  }
  for (const edge of edges) {
    if (!(idSet.has(edge.from) && idSet.has(edge.to))) {
      continue;
    }
    adj.get(edge.from)?.push(edge.to);
  }

  const memo = new Map<string, number>();
  const visiting = new Set<string>();

  const dfs = (node: string): number => {
    const cached = memo.get(node);
    if (cached !== undefined) {
      return cached;
    }
    if (visiting.has(node)) {
      return 0;
    }
    visiting.add(node);
    let best = 0;
    for (const next of adj.get(node) ?? []) {
      best = Math.max(best, 1 + dfs(next));
    }
    visiting.delete(node);
    memo.set(node, best);
    return best;
  };

  let longest = 0;
  for (const id of serviceIds) {
    longest = Math.max(longest, dfs(id));
  }
  return longest;
};

const checkDenseServices = (ctx: SignalContext): Diagnostic[] => {
  const services = ctx.project.modules.filter(
    (mod) => mod.layer === "services"
  );
  if (services.length === 0) {
    return [];
  }

  const serviceIds = services.map((mod) => mod.id);
  const serviceIdSet = new Set(serviceIds);
  const serviceEdges = ctx.graph.moduleEdges.filter(
    (edge) => serviceIdSet.has(edge.from) && serviceIdSet.has(edge.to)
  );

  const avgOutbound = serviceEdges.length / services.length;
  const longestPath = servicesLongestPath(serviceIds, serviceEdges);

  const denseByAvg =
    services.length >= ctx.thresholds.denseServicesCount &&
    avgOutbound >= ctx.thresholds.denseServicesAvgOutbound;
  const denseByPath = longestPath >= ctx.thresholds.denseServicesLongestPath;

  if (!(denseByAvg || denseByPath)) {
    return [];
  }

  return [
    {
      help: "Services subgraph is dense or deep — consider a horizontal split (domains/packages).",
      message: `Services graph density/depth suggests a split (${services.length} services, avg outbound ${avgOutbound.toFixed(1)}, longest path ${longestPath})`,
      ruleId: "dense-services",
      severity: "warning",
    },
  ];
};

const checkOrphanPublic = (ctx: SignalContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const mod of ctx.project.modules) {
    if (mod.kind !== "dir") {
      continue;
    }
    const publicDir = join(mod.rootPath, "public");
    const publicFiles = ctx.project.sourceFiles.filter((file) =>
      isUnderDir(file, publicDir)
    );
    for (const file of publicFiles) {
      const hasExternalImporter = ctx.graph.fileEdges.some((edge) => {
        if (edge.toFile !== file) {
          return false;
        }
        const fromModule = ctx.graph.moduleOfFile.get(edge.fromFile) ?? null;
        return fromModule !== mod.id;
      });
      if (hasExternalImporter) {
        continue;
      }
      out.push({
        file,
        help: "Remove unused public exports or wire an external importer.",
        message: `Public file has no importers outside module "${mod.id}"`,
        ruleId: "orphan-public",
        severity: "info",
      });
    }
  }
  return out;
};

export const runDoctorSignals = (
  project: DiscoveredProject,
  graph: ProjectGraph,
  classified: ClassifiedProject,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): Diagnostic[] => {
  const ctx: SignalContext = {
    classified,
    graph,
    project,
    thresholds,
  };

  return [
    ...checkSharedCandidate(ctx),
    ...checkStageGrowth(ctx),
    ...checkDenseServices(ctx),
    ...checkOrphanPublic(ctx),
  ];
};
