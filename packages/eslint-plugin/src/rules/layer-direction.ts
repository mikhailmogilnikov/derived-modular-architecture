import { LAYER_RANK, layerOfPath } from "@derived-modular/boundaries";
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
  const fromLayer = layerOfPath(filename, pathCtx);
  const toLayer = layerOfPath(toFile, pathCtx);
  if (fromLayer === null || toLayer === null) {
    return;
  }
  if (LAYER_RANK[fromLayer] >= LAYER_RANK[toLayer]) {
    return;
  }
  context.report({
    data: { from: fromLayer, to: toLayer },
    messageId: "upward",
    node,
  });
};

export const layerDirection: Rule.RuleModule = {
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
        "Enforce downward imports: app → features → services → shared",
    },
    messages: {
      upward: "Upward import from {{from}} to {{to}}",
    },
    schema: [],
    type: "problem",
  },
};
