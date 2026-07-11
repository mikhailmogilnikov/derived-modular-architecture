import {
  isBarrelIndexFilename,
  moduleRefOfPath,
  rewriteBarrelSpecifier,
} from "@derived-modular/boundaries";
import type { Rule } from "eslint";
import { isBarrelReexportFile, uniqueBarrelTarget } from "../barrel-fix.js";
import { resolveImportTarget } from "../resolve-import.js";
import { getPathContext } from "../settings.js";

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

const checkImportOfBarrel = (
  context: Rule.RuleContext,
  node: Rule.Node,
  sourceNode: Rule.Node & {
    range?: [number, number];
    value?: unknown;
  },
  specifier: string
): void => {
  const { filename } = context;
  if (filename === "<input>" || filename === "<text>") {
    return;
  }
  const pathCtx = getPathContext(context, filename);
  const toFile = resolveImportTarget(filename, specifier, pathCtx.srcRoot);
  if (toFile === null || !isBarrelReexportFile(toFile)) {
    return;
  }
  const toMod = moduleRefOfPath(toFile, pathCtx);
  if (toMod === null || toMod.kind === "file") {
    return;
  }
  const fromMod = moduleRefOfPath(filename, pathCtx);
  if (fromMod?.id === toMod.id) {
    return;
  }

  const target = uniqueBarrelTarget(toFile, pathCtx.srcRoot);
  const fixSpecifier =
    target === null ? null : rewriteBarrelSpecifier(specifier, toFile, target);

  const report: Rule.ReportDescriptor = {
    data: { moduleId: toMod.id },
    messageId: "barrelImport",
    node,
  };
  if (fixSpecifier !== null && sourceNode.range !== undefined) {
    const quote = context.sourceCode.getText(sourceNode)[0] === "'" ? "'" : '"';
    const [start, end] = sourceNode.range;
    report.fix = (fixer) =>
      fixer.replaceTextRange([start, end], `${quote}${fixSpecifier}${quote}`);
  }
  context.report(report);
};

export const noBarrel: Rule.RuleModule = {
  create(context) {
    const { filename } = context;
    if (filename === "<input>" || filename === "<text>") {
      return {};
    }

    const base = filename.split(FILENAME_SEPARATOR).pop() ?? "";
    const pathCtx = getPathContext(context, filename);
    const mod = moduleRefOfPath(filename, pathCtx);
    const isBarrelFile = isBarrelIndexFilename(base) && mod !== null;
    let reportedBarrelFile = false;

    const visitExportFrom = (node: Rule.Node, source?: string | null) => {
      if (source && !isBarrelFile) {
        const sourceNode = (
          node as {
            source?: Rule.Node & { range?: [number, number]; value?: unknown };
          }
        ).source;
        if (sourceNode) {
          checkImportOfBarrel(context, node, sourceNode, source);
        }
      }
      if (!(isBarrelFile && hasExportFrom(node)) || reportedBarrelFile) {
        return;
      }
      reportedBarrelFile = true;
      context.report({
        data: { moduleId: mod.id },
        messageId: "barrel",
        node,
      });
    };

    return {
      ExportAllDeclaration(node) {
        const source =
          node.source && typeof node.source.value === "string"
            ? node.source.value
            : null;
        visitExportFrom(node as Rule.Node, source);
      },
      ExportNamedDeclaration(node) {
        const source =
          node.source && typeof node.source.value === "string"
            ? node.source.value
            : null;
        visitExportFrom(node as Rule.Node, source);
      },
      ImportDeclaration(node) {
        if (typeof node.source.value === "string") {
          checkImportOfBarrel(
            context,
            node as Rule.Node,
            node.source as Rule.Node & {
              range?: [number, number];
              value?: unknown;
            },
            node.source.value
          );
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow barrel index re-export surfaces inside DMA modules",
    },
    fixable: "code",
    messages: {
      barrel: 'Barrel re-export file in module "{{moduleId}}"',
      barrelImport:
        'Import resolves to barrel index in module "{{moduleId}}"; use a direct public path',
    },
    schema: [],
    type: "problem",
  },
};
