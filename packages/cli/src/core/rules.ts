import { readFileSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import {
  type Layer as BoundariesLayer,
  DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  LAYER_RANK,
  type Layer,
  layerOfPath,
} from "@derived-modular/boundaries";
import ts from "typescript";
import type { ClassifiedProject } from "./classify";
import type { DiscoveredProject } from "./discover";
import type { ProjectGraph } from "./graph";
import type { Diagnostic, ModuleRef } from "./types";

interface RuleContext {
  classified: ClassifiedProject;
  graph: ProjectGraph;
  modulesById: Map<string, ModuleRef>;
  project: DiscoveredProject;
}

const isUnderDir = (filePath: string, dirPath: string): boolean => {
  const rel = relative(dirPath, filePath);
  return rel !== "" && !rel.startsWith(`..${sep}`) && !rel.startsWith("..");
};

const layerOfFile = (filePath: string, ctx: RuleContext): Layer | null => {
  const moduleId = ctx.graph.moduleOfFile.get(filePath) ?? null;
  if (moduleId !== null) {
    return ctx.modulesById.get(moduleId)?.layer ?? null;
  }
  const compositionRootDirnames =
    ctx.project.compositionRoots.length > 0
      ? ctx.project.compositionRoots.map((root) => basename(root))
      : [...DEFAULT_COMPOSITION_ROOT_DIRNAMES];
  return layerOfPath(filePath, {
    compositionRootDirnames,
    srcRoot: ctx.project.srcRoot,
  }) as BoundariesLayer | null;
};

const edgeRange = (line: number, column: number) => ({ column, line });

const hasExportFrom = (filePath: string, sourceText: string): boolean => {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found) {
      return;
    }
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
};

const updateLowlinkFromNeighbor = (
  v: string,
  w: string,
  indices: Map<string, number>,
  lowlink: Map<string, number>,
  onStack: Set<string>,
  strongConnect: (node: string) => void
): void => {
  if (!indices.has(w)) {
    strongConnect(w);
    lowlink.set(v, Math.min(lowlink.get(v) ?? 0, lowlink.get(w) ?? 0));
    return;
  }
  if (onStack.has(w)) {
    lowlink.set(v, Math.min(lowlink.get(v) ?? 0, indices.get(w) ?? 0));
  }
};

const popScc = (v: string, stack: string[], onStack: Set<string>): string[] => {
  const scc: string[] = [];
  for (;;) {
    const w = stack.pop();
    if (w === undefined) {
      break;
    }
    onStack.delete(w);
    scc.push(w);
    if (w === v) {
      break;
    }
  }
  return scc;
};

const findSccs = (nodes: string[], edges: { from: string; to: string }[]) => {
  const adj = new Map<string, string[]>();
  for (const id of nodes) {
    adj.set(id, []);
  }
  for (const edge of edges) {
    adj.get(edge.from)?.push(edge.to);
  }

  let index = 0;
  const indices = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const sccs: string[][] = [];

  const strongConnect = (v: string): void => {
    indices.set(v, index);
    lowlink.set(v, index);
    index += 1;
    stack.push(v);
    onStack.add(v);

    for (const w of adj.get(v) ?? []) {
      updateLowlinkFromNeighbor(v, w, indices, lowlink, onStack, strongConnect);
    }

    if (lowlink.get(v) === indices.get(v)) {
      sccs.push(popScc(v, stack, onStack));
    }
  };

  for (const v of nodes) {
    if (!indices.has(v)) {
      strongConnect(v);
    }
  }

  return sccs;
};

const checkLayerDirection = (ctx: RuleContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const edge of ctx.graph.fileEdges) {
    const fromLayer = layerOfFile(edge.fromFile, ctx);
    const toLayer = layerOfFile(edge.toFile, ctx);
    if (fromLayer === null || toLayer === null) {
      continue;
    }
    if (LAYER_RANK[fromLayer] >= LAYER_RANK[toLayer]) {
      continue;
    }
    out.push({
      file: edge.fromFile,
      help: "Import only downward: app → features → services → shared.",
      message: `Upward import from ${fromLayer} to ${toLayer}`,
      range: edgeRange(edge.line, edge.column),
      ruleId: "layer-direction",
      severity: "error",
    });
  }
  return out;
};

const findFileEdgeForModules = (
  ctx: RuleContext,
  fromId: string,
  toId: string
) =>
  ctx.graph.fileEdges.find((fe) => {
    const fromModule = ctx.graph.moduleOfFile.get(fe.fromFile);
    const toModule = ctx.graph.moduleOfFile.get(fe.toFile);
    return fromModule === fromId && toModule === toId;
  });

const checkFeatureToFeature = (ctx: RuleContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const edge of ctx.graph.moduleEdges) {
    const fromMod = ctx.modulesById.get(edge.from);
    const toMod = ctx.modulesById.get(edge.to);
    if (!(fromMod && toMod)) {
      continue;
    }
    if (fromMod.layer !== "features" || toMod.layer !== "features") {
      continue;
    }
    const fileEdge = findFileEdgeForModules(ctx, edge.from, edge.to);
    out.push({
      file: fileEdge?.fromFile ?? fromMod.rootPath,
      help: "Features must not import other features; promote shared flow to services/.",
      message: `Feature "${fromMod.name}" imports feature "${toMod.name}"`,
      range: fileEdge ? edgeRange(fileEdge.line, fileEdge.column) : undefined,
      ruleId: "feature-to-feature",
      severity: "error",
    });
  }
  return out;
};

const checkPublicApi = (ctx: RuleContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const edge of ctx.graph.fileEdges) {
    const fromModule = ctx.graph.moduleOfFile.get(edge.fromFile) ?? null;
    const toModule = ctx.graph.moduleOfFile.get(edge.toFile) ?? null;
    if (toModule === null || fromModule === toModule) {
      continue;
    }
    const toMod = ctx.modulesById.get(toModule);
    if (!toMod || toMod.kind === "file") {
      continue;
    }
    const publicDir = join(toMod.rootPath, "public");
    if (isUnderDir(edge.toFile, publicDir)) {
      continue;
    }
    out.push({
      file: edge.fromFile,
      help: "Import only from the target module's public/ (or a stage-0 file module).",
      message: `Deep import into module "${toMod.id}" outside public/`,
      range: edgeRange(edge.line, edge.column),
      ruleId: "public-api",
      severity: "error",
    });
  }
  return out;
};

const checkNoBarrel = (ctx: RuleContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const mod of ctx.project.modules) {
    const candidates =
      mod.kind === "file"
        ? [mod.rootPath]
        : ctx.project.sourceFiles.filter((file) =>
            isUnderDir(file, mod.rootPath)
          );
    for (const filePath of candidates) {
      const name = basename(filePath);
      if (name !== "index.ts" && name !== "index.tsx") {
        continue;
      }
      const sourceText = readFileSync(filePath, "utf8");
      if (!hasExportFrom(filePath, sourceText)) {
        continue;
      }
      out.push({
        file: filePath,
        help: "Remove barrel index re-exports; import public files by direct path.",
        message: `Barrel re-export file in module "${mod.id}"`,
        ruleId: "no-barrel",
        severity: "error",
      });
    }
  }
  return out;
};

const checkNoCycle = (ctx: RuleContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  const moduleIds = ctx.project.modules.map((mod) => mod.id);
  const sccs = findSccs(moduleIds, ctx.graph.moduleEdges);
  for (const scc of sccs) {
    if (scc.length <= 1) {
      continue;
    }
    const sorted = [...scc].sort();
    const first = ctx.modulesById.get(sorted[0] ?? "");
    out.push({
      file: first?.rootPath,
      help: "Break the cycle by extracting a lower-layer dependency or inverting the edge.",
      message: `Circular dependency among modules: ${sorted.join(" → ")}`,
      ruleId: "no-cycle",
      severity: "error",
    });
  }
  return out;
};

const checkFeatureHasInbound = (ctx: RuleContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const mod of ctx.project.modules) {
    if (mod.layer !== "features") {
      continue;
    }
    const inbound = ctx.classified.inboundFromModules.get(mod.id);
    if (!inbound || inbound.size === 0) {
      continue;
    }
    out.push({
      file: mod.rootPath,
      help: "Promote this feature to services/ — it has inbound edges from other modules.",
      message: `Feature "${mod.name}" has inbound module dependencies`,
      ruleId: "feature-has-inbound",
      severity: "error",
    });
  }
  return out;
};

const checkServiceNoInbound = (ctx: RuleContext): Diagnostic[] => {
  const out: Diagnostic[] = [];
  for (const mod of ctx.project.modules) {
    if (mod.layer !== "services") {
      continue;
    }
    const inbound = ctx.classified.inboundFromModules.get(mod.id);
    if (inbound && inbound.size > 0) {
      continue;
    }
    out.push({
      file: mod.rootPath,
      help: "A service must be consumed by other modules; remove it or demote if unused.",
      message: `Service "${mod.name}" has no inbound module dependencies`,
      ruleId: "service-no-inbound",
      severity: "error",
    });
  }
  return out;
};

export const runCheckRules = (
  project: DiscoveredProject,
  graph: ProjectGraph,
  classified: ClassifiedProject
): Diagnostic[] => {
  const ctx: RuleContext = {
    classified,
    graph,
    modulesById: new Map(project.modules.map((mod) => [mod.id, mod] as const)),
    project,
  };

  return [
    ...checkLayerDirection(ctx),
    ...checkFeatureToFeature(ctx),
    ...checkPublicApi(ctx),
    ...checkNoBarrel(ctx),
    ...checkNoCycle(ctx),
    ...checkFeatureHasInbound(ctx),
    ...checkServiceNoInbound(ctx),
  ];
};
