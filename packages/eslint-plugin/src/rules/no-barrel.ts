import {
  isBarrelIndexFilename,
  moduleRefOfPath,
} from "@derived-modular/boundaries";
import type { Rule } from "eslint";
import { getPathContext } from "../settings.ts";

const FILENAME_SEPARATOR = /[/\\]/;

const hasExportFrom = (node: Rule.Node): boolean => {
  if (node.type === "ExportAllDeclaration" && node.source) {
    return true;
  }
  if (node.type === "ExportNamedDeclaration" && node.source) {
    return true;
  }
  return false;
};

export const noBarrel: Rule.RuleModule = {
  create(context) {
    const { filename } = context;
    if (filename === "<input>" || filename === "<text>") {
      return {};
    }
    const base = filename.split(FILENAME_SEPARATOR).pop() ?? "";
    if (!isBarrelIndexFilename(base)) {
      return {};
    }
    const pathCtx = getPathContext(context, filename);
    const mod = moduleRefOfPath(filename, pathCtx);
    if (mod === null) {
      return {};
    }

    let reported = false;
    return {
      ExportAllDeclaration(node) {
        if (reported || !hasExportFrom(node as Rule.Node)) {
          return;
        }
        reported = true;
        context.report({
          data: { moduleId: mod.id },
          messageId: "barrel",
          node,
        });
      },
      ExportNamedDeclaration(node) {
        if (reported || !hasExportFrom(node as Rule.Node)) {
          return;
        }
        reported = true;
        context.report({
          data: { moduleId: mod.id },
          messageId: "barrel",
          node,
        });
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow barrel index re-export surfaces inside DMA modules",
    },
    messages: {
      barrel: 'Barrel re-export file in module "{{moduleId}}"',
    },
    schema: [],
    type: "problem",
  },
};
