import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { DmaEnvironmentError } from "../core/errors";
import type { FixAction, FixPlan } from "./fix-plan";
import { replaceSpecifierAt } from "./promote-rewrite";

interface FileSnapshot {
  content: Buffer;
  path: string;
}

const applyRewritesToText = (
  sourceText: string,
  ops: Extract<FixAction, { kind: "rewrite-specifier" }>[]
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

const restoreSnapshots = (snapshots: FileSnapshot[]): void => {
  for (const snap of snapshots) {
    writeFileSync(snap.path, snap.content);
  }
};

export const applyFixPlan = (plan: FixPlan): { applied: number } => {
  const rewritesByFile = new Map<
    string,
    Extract<FixAction, { kind: "rewrite-specifier" }>[]
  >();
  const deletes: Extract<FixAction, { kind: "delete-file" }>[] = [];

  for (const action of plan.actions) {
    if (action.kind === "delete-file") {
      deletes.push(action);
      continue;
    }
    const list = rewritesByFile.get(action.file) ?? [];
    list.push(action);
    rewritesByFile.set(action.file, list);
  }

  const snapshots: FileSnapshot[] = [];

  try {
    for (const [file, ops] of rewritesByFile) {
      const before = readFileSync(file);
      snapshots.push({ content: before, path: file });
      const after = applyRewritesToText(before.toString("utf8"), ops);
      writeFileSync(file, after, "utf8");
    }

    for (const action of deletes) {
      const before = readFileSync(action.file);
      snapshots.push({ content: before, path: action.file });
      unlinkSync(action.file);
    }
  } catch (error) {
    restoreSnapshots(snapshots);
    if (error instanceof DmaEnvironmentError || error instanceof Error) {
      throw new DmaEnvironmentError(
        `Fix apply failed; rolled back ${snapshots.length} file(s): ${error.message}`,
        { cause: error }
      );
    }
    throw error;
  }

  return { applied: plan.actions.length };
};
