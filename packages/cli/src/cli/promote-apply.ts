import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { analyze } from "../core/analyze";
import type { ResolvedDmaOptions } from "../core/config-types";
import { DmaEnvironmentError } from "../core/errors";
import { resolveImport } from "../core/resolve";
import { loadPathAliases } from "../core/tsconfig-paths";
import {
  baselineErrors,
  collectErrorFingerprints,
  type PromotePlan,
} from "./promote-plan";
import { isPathInside, replaceSpecifierAt } from "./promote-rewrite";

const FEATURE_INBOUND_NAME_RE = /Feature "([^"]+)" has inbound/;

interface FileSnapshot {
  content: Buffer;
  path: string;
}

const listFilesRecursive = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
};

const mapPathAfterMove = (
  file: string,
  oldRoot: string,
  newRoot: string
): string => {
  if (!isPathInside(file, oldRoot)) {
    return file;
  }
  return join(newRoot, relative(oldRoot, file));
};

const applyRewritesToText = (
  sourceText: string,
  ops: PromotePlan["rewrites"]
): string => {
  const ordered = [...ops].sort((a, b) => {
    if (a.line !== b.line) {
      return b.line - a.line;
    }
    return b.column - a.column;
  });
  let text = sourceText;
  for (const op of ordered) {
    text = replaceSpecifierAt(
      text,
      op.line,
      op.column,
      op.oldSpecifier,
      op.newSpecifier
    );
  }
  return text;
};

const restoreModule = (
  plan: PromotePlan,
  moduleSnapshot: FileSnapshot[]
): void => {
  if (existsSync(plan.newRoot)) {
    rmSync(plan.newRoot, { force: true, recursive: true });
  }
  for (const file of moduleSnapshot) {
    mkdirSync(dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.content);
  }
};

export const applyPromote = (
  plan: PromotePlan,
  options: ResolvedDmaOptions
): { rewritten: number } => {
  const beforeErrors = baselineErrors(plan, options);

  const moduleSnapshot: FileSnapshot[] = listFilesRecursive(plan.oldRoot).map(
    (path) => ({
      content: readFileSync(path),
      path,
    })
  );

  const rewritesByFile = new Map<string, PromotePlan["rewrites"]>();
  for (const rewrite of plan.rewrites) {
    const list = rewritesByFile.get(rewrite.file) ?? [];
    list.push(rewrite);
    rewritesByFile.set(rewrite.file, list);
  }

  const externalSnapshots: FileSnapshot[] = [];
  const pendingWrites: { content: string; path: string }[] = [];

  for (const [file, ops] of rewritesByFile) {
    const before = readFileSync(file, "utf8");
    const after = applyRewritesToText(before, ops);
    const afterPath = mapPathAfterMove(file, plan.oldRoot, plan.newRoot);
    if (afterPath === file) {
      externalSnapshots.push({
        content: Buffer.from(before, "utf8"),
        path: file,
      });
    }
    pendingWrites.push({ content: after, path: afterPath });
  }

  if (existsSync(plan.newRoot)) {
    throw new DmaEnvironmentError(
      `Target already exists: services/${plan.moduleName}`
    );
  }

  mkdirSync(plan.servicesDir, { recursive: true });
  renameSync(plan.oldRoot, plan.newRoot);

  try {
    for (const write of pendingWrites) {
      mkdirSync(dirname(write.path), { recursive: true });
      writeFileSync(write.path, write.content, "utf8");
    }

    const aliases = loadPathAliases(plan.projectRoot);
    for (const rewrite of plan.rewrites) {
      const file = mapPathAfterMove(rewrite.file, plan.oldRoot, plan.newRoot);
      const resolved = resolveImport(
        file,
        rewrite.newSpecifier,
        aliases,
        plan.projectRoot
      );
      if (resolved === null) {
        throw new DmaEnvironmentError(
          `Rewritten import does not resolve after promote: ${rewrite.newSpecifier} in ${relative(plan.projectRoot, file)}`
        );
      }
    }

    const result = analyze(plan.projectRoot, "check", {
      compositionRoots: options.compositionRoots,
      srcRoot: options.srcRoot,
      thresholds: options.thresholds,
    });
    const afterErrors = collectErrorFingerprints(result.diagnostics, plan);

    const stillInbound = result.diagnostics.some((diagnostic) => {
      if (diagnostic.ruleId !== "feature-has-inbound") {
        return false;
      }
      const match = FEATURE_INBOUND_NAME_RE.exec(diagnostic.message);
      return match?.[1] === plan.moduleName;
    });
    if (stillInbound) {
      throw new DmaEnvironmentError(
        `Post-check still reports feature-has-inbound for features/${plan.moduleName}.`
      );
    }

    const newErrors: string[] = [];
    for (const fingerprint of afterErrors) {
      if (!beforeErrors.has(fingerprint)) {
        newErrors.push(fingerprint);
      }
    }
    if (newErrors.length > 0) {
      throw new DmaEnvironmentError(
        `Post-check found new errors after promote:\n  ${newErrors.slice(0, 5).join("\n  ")}`
      );
    }
  } catch (error) {
    for (const snap of externalSnapshots) {
      writeFileSync(snap.path, snap.content);
    }
    restoreModule(plan, moduleSnapshot);
    throw error;
  }

  return { rewritten: plan.rewrites.length };
};
