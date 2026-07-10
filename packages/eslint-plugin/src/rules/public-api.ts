import {
  isPublicImportTarget,
  moduleRefOfPath,
} from "@derived-modular/boundaries";
import type { Rule } from "eslint";
import { resolveImportTarget } from "../resolve-import.ts";
import { getPathContext } from "../settings.ts";

const checkImport = (
  context: Rule.RuleContext,
  node: Rule.Node,
  specifier: string
): void => {
  const { filename } = context;
  if (filename === "<input>" || filename === "<text>") {
    return;
  }
  const pathCtx = getPathContext(context, filename);
  const toFile = resolveImportTarget(filename, specifier, pathCtx.srcRoot);
  if (toFile === null) {
    return;
  }
  const fromMod = moduleRefOfPath(filename, pathCtx);
  const toMod = moduleRefOfPath(toFile, pathCtx);
  if (toMod === null || toMod.kind === "file") {
    return;
  }
  if (fromMod?.id === toMod.id) {
    return;
  }
  if (isPublicImportTarget(toFile, pathCtx)) {
    return;
  }
  context.report({
    data: { moduleId: toMod.id },
    messageId: "deep",
    node,
  });
};

export const publicApi: Rule.RuleModule = {
  create(context) {
    return {
      ExportAllDeclaration(node) {
        if (node.source && typeof node.source.value === "string") {
          checkImport(context, node as Rule.Node, node.source.value);
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && typeof node.source.value === "string") {
          checkImport(context, node as Rule.Node, node.source.value);
        }
      },
      ImportDeclaration(node) {
        if (typeof node.source.value === "string") {
          checkImport(context, node as Rule.Node, node.source.value);
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Require cross-module imports to target */public/* (or stage-0 files)",
    },
    messages: {
      deep: 'Deep import into module "{{moduleId}}" outside public/',
    },
    schema: [],
    type: "problem",
  },
};
