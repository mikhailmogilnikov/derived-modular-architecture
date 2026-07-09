import ts from "typescript";
import { isMarkdownFilePath, isSfcFilePath } from "./source-files";
import type { ImportSpec } from "./types";

interface ScriptRegion {
  content: string;
  /** 0-based column of the first content character on startLine */
  startColumn: number;
  /** 0-based line of the first content character in the original file */
  startLine: number;
}

const SCRIPT_TAG_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;
const ASTRO_FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
const SCRIPT_SRC_ATTR_RE = /\bsrc\s*=/;
const SCRIPT_TYPE_ATTR_RE = /\btype\s*=\s*["']([^"']+)["']/;
const IMPORTISH_LINE_RE = /^(?:import|export)\b|\bimport\s*\(|\brequire\s*\(/;

const shouldSkipScriptAttrs = (attrs: string): boolean => {
  const lower = attrs.toLowerCase();
  if (SCRIPT_SRC_ATTR_RE.test(lower)) {
    return true;
  }
  const typeMatch = lower.match(SCRIPT_TYPE_ATTR_RE);
  if (!typeMatch) {
    return false;
  }
  const type = typeMatch[1] ?? "";
  return !(
    type === "" ||
    type.includes("javascript") ||
    type.includes("typescript") ||
    type === "module" ||
    type === "text/jsx" ||
    type === "text/tsx"
  );
};

const offsetOf = (
  text: string,
  index: number
): { line: number; column: number } => {
  let line = 0;
  let column = 0;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 0;
    } else {
      column += 1;
    }
  }
  return { column, line };
};

const blankNonImportLines = (text: string): string =>
  text
    .split("\n")
    .map((line) => (IMPORTISH_LINE_RE.test(line.trimStart()) ? line : ""))
    .join("\n");

const stripFrontmatterPreservingLines = (text: string): string => {
  const match = FRONTMATTER_RE.exec(text);
  if (!match) {
    return text;
  }
  const newlineCount = (match[0].match(/\n/g) ?? []).length;
  return `${"\n".repeat(newlineCount)}${text.slice(match[0].length)}`;
};

const extractSfcScriptRegions = (
  filePath: string,
  sourceText: string
): ScriptRegion[] => {
  const regions: ScriptRegion[] = [];
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.endsWith(".astro")) {
    const frontmatter = ASTRO_FRONTMATTER_RE.exec(sourceText);
    if (frontmatter?.[1] !== undefined) {
      const contentStart =
        frontmatter.index + frontmatter[0].indexOf(frontmatter[1]);
      const { column, line } = offsetOf(sourceText, contentStart);
      regions.push({
        content: frontmatter[1],
        startColumn: column,
        startLine: line,
      });
    }
  }

  for (const match of sourceText.matchAll(SCRIPT_TAG_RE)) {
    const attrs = match[1] ?? "";
    const content = match[2] ?? "";
    if (shouldSkipScriptAttrs(attrs)) {
      continue;
    }
    const full = match[0] ?? "";
    const openEnd = full.indexOf(">") + 1;
    const contentStart = (match.index ?? 0) + openEnd;
    const { column, line } = offsetOf(sourceText, contentStart);
    regions.push({
      content,
      startColumn: column,
      startLine: line,
    });
  }

  return regions;
};

const pushSpec = (
  specs: ImportSpec[],
  filePath: string,
  sourceFile: ts.SourceFile,
  specifierNode: ts.StringLiteral,
  isTypeOnly: boolean,
  lineOffset: number,
  columnOffsetOnFirstLine: number
): void => {
  const { character, line } = sourceFile.getLineAndCharacterOfPosition(
    specifierNode.getStart(sourceFile)
  );
  const absoluteLine = lineOffset + line;
  const absoluteColumn =
    line === 0 ? columnOffsetOnFirstLine + character : character;

  specs.push({
    column: absoluteColumn + 1,
    fromFile: filePath,
    isTypeOnly,
    line: absoluteLine + 1,
    specifier: specifierNode.text,
  });
};

const isRequireCall = (expression: ts.Expression): boolean =>
  ts.isIdentifier(expression) && expression.text === "require";

const moduleSpecifierFromNode = (
  node: ts.ImportDeclaration | ts.ExportDeclaration
): { isTypeOnly: boolean; specifier: ts.StringLiteral } | null => {
  const { moduleSpecifier } = node;
  if (!(moduleSpecifier && ts.isStringLiteral(moduleSpecifier))) {
    return null;
  }
  const isTypeOnly = ts.isImportDeclaration(node)
    ? (node.importClause?.isTypeOnly ?? false)
    : (node.isTypeOnly ?? false);
  return { isTypeOnly, specifier: moduleSpecifier };
};

const stringLiteralArg = (node: ts.CallExpression): ts.StringLiteral | null => {
  const [arg] = node.arguments;
  return arg && ts.isStringLiteral(arg) ? arg : null;
};

const collectFromTsAst = (
  filePath: string,
  sourceText: string,
  virtualPath: string,
  lineOffset: number,
  columnOffsetOnFirstLine: number,
  specs: ImportSpec[]
): void => {
  if (sourceText.trim() === "") {
    return;
  }

  const sourceFile = ts.createSourceFile(
    virtualPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const emit = (specifier: ts.StringLiteral, isTypeOnly: boolean): void => {
    pushSpec(
      specs,
      filePath,
      sourceFile,
      specifier,
      isTypeOnly,
      lineOffset,
      columnOffsetOnFirstLine
    );
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const parsed = moduleSpecifierFromNode(node);
      if (parsed) {
        emit(parsed.specifier, parsed.isTypeOnly);
      }
    } else if (ts.isCallExpression(node)) {
      const arg = stringLiteralArg(node);
      if (
        arg &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          isRequireCall(node.expression))
      ) {
        emit(arg, false);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
};

const collectMarkdownImports = (
  filePath: string,
  sourceText: string,
  specs: ImportSpec[]
): void => {
  const withoutFrontmatter = stripFrontmatterPreservingLines(sourceText);

  for (const region of extractSfcScriptRegions(filePath, withoutFrontmatter)) {
    collectFromTsAst(
      filePath,
      region.content,
      `${filePath}.script.ts`,
      region.startLine,
      region.startColumn,
      specs
    );
  }

  const importOnly = blankNonImportLines(withoutFrontmatter);
  collectFromTsAst(
    filePath,
    importOnly,
    `${filePath}.imports.tsx`,
    0,
    0,
    specs
  );
};

export const parseImports = (
  filePath: string,
  sourceText: string
): ImportSpec[] => {
  const specs: ImportSpec[] = [];

  if (isMarkdownFilePath(filePath)) {
    collectMarkdownImports(filePath, sourceText, specs);
    return specs;
  }

  if (!isSfcFilePath(filePath)) {
    collectFromTsAst(filePath, sourceText, filePath, 0, 0, specs);
    return specs;
  }

  for (const region of extractSfcScriptRegions(filePath, sourceText)) {
    const lang = filePath.toLowerCase().endsWith(".vue") ? "tsx" : "ts";
    collectFromTsAst(
      filePath,
      region.content,
      `${filePath}.script.${lang}`,
      region.startLine,
      region.startColumn,
      specs
    );
  }

  return specs;
};
