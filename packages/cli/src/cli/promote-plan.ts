import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { analyze } from "../core/analyze";
import type { ResolvedDmaOptions } from "../core/config-types";
import { discover } from "../core/discover";
import { DmaEnvironmentError } from "../core/errors";
import { parseImports } from "../core/parse-imports";
import { resolveImport } from "../core/resolve";
import { loadPathAliases } from "../core/tsconfig-paths";
import type { Diagnostic } from "../core/types";
import {
  canonicalizeModuleRefs,
  isPathInside,
  normalizeModuleName,
  replaceFeaturesSegment,
  rewriteSpecifierForPromote,
} from "./promote-rewrite";

export interface PromoteRewrite {
  column: number;
  file: string;
  line: number;
  newSpecifier: string;
  oldSpecifier: string;
}

export interface PromotePlan {
  moduleName: string;
  newRoot: string;
  oldRoot: string;
  projectRoot: string;
  rewrites: PromoteRewrite[];
  servicesDir: string;
  srcRoot: string;
}

export const errorFingerprint = (
  diagnostic: Diagnostic,
  plan: Pick<PromotePlan, "moduleName" | "oldRoot" | "newRoot">
): string => {
  let file = diagnostic.file ?? "";
  if (file.length > 0 && isPathInside(file, plan.oldRoot)) {
    file = join(plan.newRoot, relative(plan.oldRoot, file));
  }
  file = file.split("\\").join("/");
  const message = canonicalizeModuleRefs(diagnostic.message, plan.moduleName);
  return `${diagnostic.ruleId}|${file}|${message}`;
};

export const collectErrorFingerprints = (
  diagnostics: Diagnostic[],
  plan: Pick<PromotePlan, "moduleName" | "oldRoot" | "newRoot">
): Set<string> => {
  const out = new Set<string>();
  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === "error") {
      out.add(errorFingerprint(diagnostic, plan));
    }
  }
  return out;
};

const assertPromoteSource = (
  srcRoot: string,
  srcRootName: string,
  moduleName: string,
  oldRoot: string,
  newRoot: string
): void => {
  if (!(existsSync(srcRoot) && statSync(srcRoot).isDirectory())) {
    throw new DmaEnvironmentError(
      `${srcRootName}/ not found — run promote inside a single DMA app package.`
    );
  }

  if (!existsSync(oldRoot)) {
    const featuresDir = join(srcRoot, "features");
    if (existsSync(featuresDir) && statSync(featuresDir).isDirectory()) {
      const stage0 = readdirSync(featuresDir, { withFileTypes: true }).some(
        (entry) =>
          entry.isFile() &&
          (entry.name === moduleName || entry.name.startsWith(`${moduleName}.`))
      );
      if (stage0) {
        throw new DmaEnvironmentError(
          `features/${moduleName} is a stage-0 file module. Promote to a folder with public/ first, then re-run dma promote.`
        );
      }
    }
    throw new DmaEnvironmentError(`Module not found: features/${moduleName}`);
  }
  if (!statSync(oldRoot).isDirectory()) {
    throw new DmaEnvironmentError(
      `features/${moduleName} is not a folder module.`
    );
  }
  const publicDir = join(oldRoot, "public");
  if (!(existsSync(publicDir) && statSync(publicDir).isDirectory())) {
    throw new DmaEnvironmentError(
      `features/${moduleName} has no public/ — only folder modules with public/ can be promoted.`
    );
  }
  if (existsSync(newRoot)) {
    throw new DmaEnvironmentError(
      `Target already exists: services/${moduleName}`
    );
  }
};

export const buildPromotePlan = (
  projectRoot: string,
  moduleArg: string,
  options: ResolvedDmaOptions
): PromotePlan => {
  const absoluteRoot = resolve(projectRoot);
  const srcRootName = options.srcRoot;
  const moduleName = normalizeModuleName(moduleArg, srcRootName);
  const srcRoot = join(absoluteRoot, srcRootName);
  const oldRoot = join(srcRoot, "features", moduleName);
  const newRoot = join(srcRoot, "services", moduleName);
  const servicesDir = join(srcRoot, "services");

  assertPromoteSource(srcRoot, srcRootName, moduleName, oldRoot, newRoot);

  const project = discover(absoluteRoot, {
    compositionRoots: options.compositionRoots,
    srcRoot: srcRootName,
  });
  const aliases = loadPathAliases(absoluteRoot);
  const rewrites: PromoteRewrite[] = [];

  for (const fromFile of project.sourceFiles) {
    const sourceText = readFileSync(fromFile, "utf8");
    const imports = parseImports(fromFile, sourceText);
    for (const spec of imports) {
      const toFile = resolveImport(
        fromFile,
        spec.specifier,
        aliases,
        absoluteRoot
      );
      if (toFile === null || !isPathInside(toFile, oldRoot)) {
        continue;
      }
      // Whole-tree rename keeps intra-module relative imports valid — do not rewrite them.
      if (
        isPathInside(fromFile, oldRoot) &&
        replaceFeaturesSegment(spec.specifier, moduleName) === null
      ) {
        continue;
      }
      const newSpecifier = rewriteSpecifierForPromote(
        spec.specifier,
        moduleName,
        fromFile,
        toFile,
        oldRoot,
        newRoot
      );
      if (newSpecifier === spec.specifier) {
        continue;
      }
      rewrites.push({
        column: spec.column,
        file: fromFile,
        line: spec.line,
        newSpecifier,
        oldSpecifier: spec.specifier,
      });
    }
  }

  return {
    moduleName,
    newRoot,
    oldRoot,
    projectRoot: absoluteRoot,
    rewrites,
    servicesDir,
    srcRoot,
  };
};

export const formatPromotePlan = (
  plan: PromotePlan,
  apply: boolean
): string => {
  const lines = [
    apply ? "dma promote --apply" : "dma promote (dry-run)",
    "",
    `  move  features/${plan.moduleName}/ → services/${plan.moduleName}/`,
    `  rewrite ${plan.rewrites.length} import(s)`,
  ];
  for (const item of plan.rewrites) {
    const rel = relative(plan.projectRoot, item.file).split("\\").join("/");
    lines.push(
      `    ${rel}:${item.line}  ${item.oldSpecifier} → ${item.newSpecifier}`
    );
  }
  if (!apply) {
    lines.push("", "Re-run with --apply to write changes.");
  }
  return `${lines.join("\n")}\n`;
};

export const baselineErrors = (
  plan: PromotePlan,
  options: ResolvedDmaOptions
): Set<string> => {
  const result = analyze(plan.projectRoot, "check", {
    compositionRoots: options.compositionRoots,
    srcRoot: options.srcRoot,
  });
  return collectErrorFingerprints(result.diagnostics, plan);
};
