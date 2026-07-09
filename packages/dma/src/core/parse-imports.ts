import ts from "typescript";
import type { ImportSpec } from "./types";

export const parseImports = (
  filePath: string,
  sourceText: string
): ImportSpec[] => {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  const specs: ImportSpec[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const { moduleSpecifier } = node;
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const { character, line } = sourceFile.getLineAndCharacterOfPosition(
          moduleSpecifier.getStart(sourceFile)
        );
        const isTypeOnly = ts.isImportDeclaration(node)
          ? (node.importClause?.isTypeOnly ?? false)
          : (node.isTypeOnly ?? false);
        specs.push({
          column: character + 1,
          fromFile: filePath,
          isTypeOnly,
          line: line + 1,
          specifier: moduleSpecifier.text,
        });
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return specs;
};
