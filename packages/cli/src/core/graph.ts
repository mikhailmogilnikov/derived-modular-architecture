import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import type { DiscoveredProject } from "./discover";
import { parseImports } from "./parse-imports";
import { resolveImport } from "./resolve";
import type { PathAlias } from "./tsconfig-paths";
import type { ResolvedEdge } from "./types";

export interface ProjectGraph {
  fileEdges: ResolvedEdge[];
  moduleEdges: { from: string; to: string }[];
  moduleOfFile: Map<string, string | null>;
}

const buildModuleOfFile = (
  project: DiscoveredProject
): Map<string, string | null> => {
  const moduleOfFile = new Map<string, string | null>();

  for (const file of project.sourceFiles) {
    let owner: string | null = null;
    for (const mod of project.modules) {
      if (mod.kind === "file") {
        if (file === mod.rootPath) {
          owner = mod.id;
          break;
        }
        continue;
      }
      const rel = relative(mod.rootPath, file);
      if (rel && !rel.startsWith(`..${sep}`) && !rel.startsWith("..")) {
        owner = mod.id;
        break;
      }
    }
    moduleOfFile.set(file, owner);
  }

  return moduleOfFile;
};

export const buildGraph = (
  project: DiscoveredProject,
  aliases: PathAlias[]
): ProjectGraph => {
  const moduleOfFile = buildModuleOfFile(project);
  const fileEdges: ResolvedEdge[] = [];
  const moduleEdgeKeys = new Set<string>();
  const moduleEdges: { from: string; to: string }[] = [];

  for (const fromFile of project.sourceFiles) {
    const sourceText = readFileSync(fromFile, "utf8");
    const imports = parseImports(fromFile, sourceText);
    for (const spec of imports) {
      const toFile = resolveImport(
        fromFile,
        spec.specifier,
        aliases,
        project.projectRoot
      );
      if (toFile === null) {
        continue;
      }
      fileEdges.push({
        column: spec.column,
        fromFile,
        isTypeOnly: spec.isTypeOnly,
        line: spec.line,
        toFile,
      });

      const fromModule = moduleOfFile.get(fromFile) ?? null;
      const toModule = moduleOfFile.get(toFile) ?? null;
      if (fromModule !== null && toModule !== null && fromModule !== toModule) {
        const key = `${fromModule}->${toModule}`;
        if (!moduleEdgeKeys.has(key)) {
          moduleEdgeKeys.add(key);
          moduleEdges.push({ from: fromModule, to: toModule });
        }
      }
    }
  }

  return { fileEdges, moduleEdges, moduleOfFile };
};
