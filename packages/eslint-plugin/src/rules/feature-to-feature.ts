import { moduleRefOfPath } from "@derived-modular/boundaries";
import type { Rule } from "eslint";
import { resolveImportTarget } from "../resolve-import.js";
import { getPathContext } from "../settings.js";

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
  if (!(fromMod && toMod)) {
    return;
  }
  if (fromMod.layer !== "features" || toMod.layer !== "features") {
    return;
  }
  if (fromMod.id === toMod.id) {
    return;
  }
  context.report({
    data: { from: fromMod.name, to: toMod.name },
    messageId: "featureToFeature",
    node,
  });
};

export const featureToFeature: Rule.RuleModule = {
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
      description: "Disallow feature → feature imports",
    },
    messages: {
      featureToFeature: 'Feature "{{from}}" imports feature "{{to}}"',
    },
    schema: [],
    type: "problem",
  },
};
