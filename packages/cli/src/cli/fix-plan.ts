import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { rewriteBarrelSpecifier } from "@derived-modular/boundaries";
import type { AnalyzeOptions } from "../core/analyze";
import { classify } from "../core/classify";
import type { DiscoveredProject } from "../core/discover";
import { discover } from "../core/discover";
import type { ProjectGraph } from "../core/graph";
import { buildGraph } from "../core/graph";
import { parseImports } from "../core/parse-imports";
import { resolveImport } from "../core/resolve";
import { runDoctorSignals } from "../core/signals";
import type { PathAlias } from "../core/tsconfig-paths";
import { loadPathAliases } from "../core/tsconfig-paths";
import type { AnalyzeMode, ModuleRef } from "../core/types";
import {
  isBarrelReexportFile,
  stripSourceExtension,
  uniqueBarrelTarget,
} from "./fix-barrel";
import { replacePathInfix } from "./promote-rewrite";

export type FixAction =
  | {
      column: number;
      file: string;
      kind: "rewrite-specifier";
      line: number;
      newSpecifier: string;
      oldSpecifier: string;
      ruleId: string;
    }
  | {
      file: string;
      kind: "delete-file";
      ruleId: string;
    };

export interface FixPlan {
  actions: FixAction[];
  mode: AnalyzeMode;
  projectRoot: string;
  skipped: string[];
}

interface FixCollector {
  actions: FixAction[];
  noteSkip: (note: string) => void;
  pushRewrite: (
    file: string,
    line: number,
    column: number,
    oldSpecifier: string,
    newSpecifier: string,
    ruleId: string
  ) => void;
  skipped: string[];
}

const isUnderDir = (filePath: string, dirPath: string): boolean => {
  const rel = relative(dirPath, filePath);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`);
};

const isExistingFile = (filePath: string): boolean => {
  try {
    return existsSync(filePath) && statSync(filePath).isFile();
  } catch {
    return false;
  }
};

const createCollector = (): FixCollector => {
  const actions: FixAction[] = [];
  const skippedNotes = new Set<string>();
  const skipped: string[] = [];
  const seenRewrite = new Set<string>();

  return {
    actions,
    noteSkip: (note: string): void => {
      if (skippedNotes.has(note)) {
        return;
      }
      skippedNotes.add(note);
      skipped.push(note);
    },
    pushRewrite: (
      file: string,
      line: number,
      column: number,
      oldSpecifier: string,
      newSpecifier: string,
      ruleId: string
    ): void => {
      if (oldSpecifier === newSpecifier) {
        return;
      }
      const key = `${file}|${line}|${column}|${oldSpecifier}`;
      if (seenRewrite.has(key)) {
        return;
      }
      seenRewrite.add(key);
      actions.push({
        column,
        file,
        kind: "rewrite-specifier",
        line,
        newSpecifier,
        oldSpecifier,
        ruleId,
      });
    },
    skipped,
  };
};

/** Only `public/<same-relative-path>` — never basename-only fallback. */
export const findSafePublicTarget = (
  mod: ModuleRef,
  deepFile: string
): string | null => {
  const deepRel = relative(mod.rootPath, deepFile).split("\\").join("/");
  if (
    deepRel.startsWith("..") ||
    deepRel.length === 0 ||
    deepRel.includes("..")
  ) {
    return null;
  }
  const mirrored = join(mod.rootPath, "public", deepRel);
  if (isExistingFile(mirrored)) {
    return mirrored;
  }
  return null;
};

export const rewriteDeepSpecifier = (
  specifier: string,
  mod: ModuleRef,
  deepFile: string,
  publicFile: string
): string | null => {
  const deepRel = relative(mod.rootPath, stripSourceExtension(deepFile))
    .split("\\")
    .join("/");
  const publicRel = relative(mod.rootPath, stripSourceExtension(publicFile))
    .split("\\")
    .join("/");
  if (deepRel.length === 0 || publicRel.length === 0) {
    return null;
  }
  return replacePathInfix(specifier, deepRel, publicRel);
};

const tryBarrelFix = (
  fromFile: string,
  specifier: string,
  line: number,
  column: number,
  toFile: string,
  graph: ProjectGraph,
  aliases: PathAlias[],
  projectRoot: string,
  collector: FixCollector
): boolean => {
  if (!isBarrelReexportFile(toFile)) {
    return false;
  }
  const fromMod = graph.moduleOfFile.get(fromFile) ?? null;
  const toModId = graph.moduleOfFile.get(toFile) ?? null;
  if (fromMod !== null && fromMod === toModId) {
    return true;
  }
  if (toModId === null) {
    return true;
  }
  const target = uniqueBarrelTarget(toFile, aliases, projectRoot);
  if (target === null) {
    collector.noteSkip(
      `no-barrel: multi-target barrel (${relative(projectRoot, toFile)})`
    );
    return true;
  }
  const newSpecifier = rewriteBarrelSpecifier(specifier, toFile, target);
  if (newSpecifier === null) {
    collector.noteSkip(
      `no-barrel: cannot rewrite ${specifier} (${relative(projectRoot, fromFile)})`
    );
    return true;
  }
  const resolved = resolveImport(fromFile, newSpecifier, aliases, projectRoot);
  if (resolved !== target) {
    collector.noteSkip(
      `no-barrel: rewritten path does not resolve (${relative(projectRoot, fromFile)})`
    );
    return true;
  }
  collector.pushRewrite(
    fromFile,
    line,
    column,
    specifier,
    newSpecifier,
    "no-barrel"
  );
  return true;
};

const tryPublicApiFix = (
  fromFile: string,
  specifier: string,
  line: number,
  column: number,
  toFile: string,
  graph: ProjectGraph,
  modulesById: Map<string, ModuleRef>,
  aliases: PathAlias[],
  projectRoot: string,
  collector: FixCollector
): void => {
  const toModuleId = graph.moduleOfFile.get(toFile) ?? null;
  const fromModuleId = graph.moduleOfFile.get(fromFile) ?? null;
  if (toModuleId === null || fromModuleId === toModuleId) {
    return;
  }
  const toMod = modulesById.get(toModuleId);
  if (!toMod || toMod.kind === "file") {
    return;
  }
  if (isUnderDir(toFile, join(toMod.rootPath, "public"))) {
    return;
  }
  const publicFile = findSafePublicTarget(toMod, toFile);
  if (publicFile === null) {
    return;
  }
  const newSpecifier = rewriteDeepSpecifier(
    specifier,
    toMod,
    toFile,
    publicFile
  );
  if (newSpecifier === null) {
    collector.noteSkip(
      `public-api: cannot rewrite ${specifier} (${relative(projectRoot, fromFile)})`
    );
    return;
  }
  const resolved = resolveImport(fromFile, newSpecifier, aliases, projectRoot);
  if (resolved !== publicFile) {
    collector.noteSkip(
      `public-api: rewritten path does not resolve (${relative(projectRoot, fromFile)})`
    );
    return;
  }
  collector.pushRewrite(
    fromFile,
    line,
    column,
    specifier,
    newSpecifier,
    "public-api"
  );
};

const loadProject = (
  projectRoot: string,
  options?: AnalyzeOptions
): {
  aliases: PathAlias[];
  graph: ProjectGraph;
  project: DiscoveredProject;
} => {
  const project = discover(projectRoot, options);
  const aliases = loadPathAliases(project.projectRoot);
  const graph = buildGraph(project, aliases);
  return { aliases, graph, project };
};

const collectCheckFixes = (
  projectRoot: string,
  options?: AnalyzeOptions
): { actions: FixAction[]; skipped: string[] } => {
  const { aliases, graph, project } = loadProject(projectRoot, options);
  const modulesById = new Map(project.modules.map((mod) => [mod.id, mod]));
  const collector = createCollector();

  for (const fromFile of project.sourceFiles) {
    const sourceText = readFileSync(fromFile, "utf8");
    for (const spec of parseImports(fromFile, sourceText)) {
      const toFile = resolveImport(
        fromFile,
        spec.specifier,
        aliases,
        projectRoot
      );
      if (toFile === null) {
        continue;
      }
      if (
        tryBarrelFix(
          fromFile,
          spec.specifier,
          spec.line,
          spec.column,
          toFile,
          graph,
          aliases,
          projectRoot,
          collector
        )
      ) {
        continue;
      }
      tryPublicApiFix(
        fromFile,
        spec.specifier,
        spec.line,
        spec.column,
        toFile,
        graph,
        modulesById,
        aliases,
        projectRoot,
        collector
      );
    }
  }

  return { actions: collector.actions, skipped: collector.skipped };
};

const collectDoctorFixes = (
  projectRoot: string,
  options?: AnalyzeOptions
): { actions: FixAction[]; skipped: string[] } => {
  const { graph, project } = loadProject(projectRoot, options);
  const classified = classify(project, graph);
  const diagnostics = runDoctorSignals(project, graph, classified);
  const collector = createCollector();

  for (const diagnostic of diagnostics) {
    if (diagnostic.ruleId !== "orphan-public" || !diagnostic.file) {
      continue;
    }
    if (!isExistingFile(diagnostic.file)) {
      collector.noteSkip(
        `orphan-public: missing ${relative(projectRoot, diagnostic.file)}`
      );
      continue;
    }
    const norm = diagnostic.file.split("\\").join("/");
    if (!norm.includes("/public/")) {
      collector.noteSkip(
        `orphan-public: refuse non-public path ${relative(projectRoot, diagnostic.file)}`
      );
      continue;
    }
    const hasAnyImporter = graph.fileEdges.some(
      (edge) => edge.toFile === diagnostic.file
    );
    if (hasAnyImporter) {
      collector.noteSkip(
        `orphan-public: still imported internally (${relative(projectRoot, diagnostic.file)})`
      );
      continue;
    }
    collector.actions.push({
      file: diagnostic.file,
      kind: "delete-file",
      ruleId: "orphan-public",
    });
  }

  return { actions: collector.actions, skipped: collector.skipped };
};

export const buildFixPlan = (
  projectRoot: string,
  mode: AnalyzeMode,
  options?: AnalyzeOptions
): FixPlan => {
  const collected =
    mode === "check"
      ? collectCheckFixes(projectRoot, options)
      : collectDoctorFixes(projectRoot, options);

  return {
    actions: collected.actions,
    mode,
    projectRoot,
    skipped: collected.skipped,
  };
};

export const formatFixPlan = (plan: FixPlan, apply: boolean): string => {
  const header = apply
    ? `dma ${plan.mode} --fix`
    : `dma ${plan.mode} --suggest`;
  const lines = [header, "", `  ${plan.actions.length} safe fix(es)`];
  for (const action of plan.actions) {
    if (action.kind === "rewrite-specifier") {
      const rel = relative(plan.projectRoot, action.file).split("\\").join("/");
      lines.push(
        `    rewrite  ${rel}:${action.line}  ${action.oldSpecifier} → ${action.newSpecifier}  [${action.ruleId}]`
      );
    } else {
      const rel = relative(plan.projectRoot, action.file).split("\\").join("/");
      lines.push(`    delete   ${rel}  [${action.ruleId}]`);
    }
  }
  if (plan.skipped.length > 0) {
    lines.push("", `  skipped ${plan.skipped.length}:`);
    for (const note of plan.skipped.slice(0, 10)) {
      lines.push(`    · ${note}`);
    }
  }
  if (!apply) {
    lines.push("", "Re-run with --fix to write changes.");
  }
  return `${lines.join("\n")}\n`;
};
