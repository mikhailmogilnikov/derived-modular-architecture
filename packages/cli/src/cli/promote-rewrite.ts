import { dirname, join, relative, sep } from "node:path";
import { DmaEnvironmentError } from "../core/errors";

const EXT_RE = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|mdx?)$/i;
const PATH_SEP_RE = /\\/g;
const TRAILING_SLASHES_RE = /\/+$/;
const LEADING_DOT_SLASH_RE = /^\.\//;

/** True if `filePath` is `dirPath` or a real descendant (not a prefix sibling). */
export const isPathInside = (filePath: string, dirPath: string): boolean => {
  const rel = relative(dirPath, filePath);
  if (rel === "") {
    return true;
  }
  return !(rel === ".." || rel.startsWith(`..${sep}`));
};

const replacePathSegment = (
  specifier: string,
  from: string,
  to: string,
  requireBeforeBoundary: boolean
): string | null => {
  let out = "";
  let i = 0;
  let replaced = false;
  while (i < specifier.length) {
    const idx = specifier.indexOf(from, i);
    if (idx === -1) {
      out += specifier.slice(i);
      break;
    }
    const before = idx === 0 ? undefined : specifier[idx - 1];
    const after = idx + from.length;
    const next = specifier[after];
    const beforeOk =
      !requireBeforeBoundary ||
      before === undefined ||
      before === "/" ||
      before === "\\";
    const afterOk =
      next === undefined ||
      next === "/" ||
      next === "\\" ||
      next === "?" ||
      next === "#";
    if (!(beforeOk && afterOk)) {
      out += specifier.slice(i, after);
      i = after;
      continue;
    }
    out += specifier.slice(i, idx) + to;
    i = after;
    replaced = true;
  }
  return replaced ? out : null;
};

/**
 * Replace `features/<name>` as a path segment only (not `features/<name>-extra`).
 * After-boundary only — also used on free-text diagnostic messages.
 */
export const replaceFeaturesSegment = (
  specifier: string,
  moduleName: string
): string | null =>
  replacePathSegment(
    specifier,
    `features/${moduleName}`,
    `services/${moduleName}`,
    false
  );

/** Stabilize features/services module refs for post-check fingerprint compare. */
export const canonicalizeModuleRefs = (
  text: string,
  moduleName: string
): string => {
  const token = `__dma_module__/${moduleName}`;
  const fromServices = replacePathSegment(
    text,
    `services/${moduleName}`,
    token,
    false
  );
  const step = fromServices ?? text;
  const fromFeatures = replacePathSegment(
    step,
    `features/${moduleName}`,
    token,
    false
  );
  return fromFeatures ?? step;
};

/** Path infix bounded on both sides (for deep-import → public rewrites). */
export const replacePathInfix = (
  specifier: string,
  from: string,
  to: string
): string | null => replacePathSegment(specifier, from, to, true);

export const normalizeModuleName = (
  raw: string,
  srcRootName = "src"
): string => {
  let value = raw
    .trim()
    .replace(PATH_SEP_RE, "/")
    .replace(TRAILING_SLASHES_RE, "");
  value = value.replace(LEADING_DOT_SLASH_RE, "");

  const prefixes = [`${srcRootName}/features/`, "features/", `${srcRootName}/`];
  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) {
      value = value.slice(prefix.length);
      break;
    }
  }

  value = value.replace(EXT_RE, "");

  if (
    value.length === 0 ||
    value.includes("/") ||
    value.includes("..") ||
    value.includes("\0") ||
    value === "." ||
    value === ".."
  ) {
    throw new DmaEnvironmentError(
      `Invalid module name "${raw}". Expected a features folder name, e.g. promo or features/promo.`
    );
  }

  return value;
};

export const rewriteSpecifierForPromote = (
  specifier: string,
  moduleName: string,
  fromFile: string,
  oldToFile: string,
  oldModuleRoot: string,
  newModuleRoot: string
): string => {
  const segmented = replaceFeaturesSegment(specifier, moduleName);
  if (segmented !== null) {
    return segmented;
  }

  if (!(specifier.startsWith("./") || specifier.startsWith("../"))) {
    throw new DmaEnvironmentError(
      `Cannot safely rewrite import "${specifier}" in ${fromFile} (expected features/${moduleName} as a path segment or a relative specifier).`
    );
  }

  if (!isPathInside(oldToFile, oldModuleRoot)) {
    throw new DmaEnvironmentError(
      `Refusing rewrite: resolved target ${oldToFile} is not inside ${oldModuleRoot}.`
    );
  }

  const newToFile = join(newModuleRoot, relative(oldModuleRoot, oldToFile));

  let rel = relative(dirname(fromFile), newToFile).replace(PATH_SEP_RE, "/");
  if (!(rel.startsWith("./") || rel.startsWith("../"))) {
    rel = `./${rel}`;
  }
  if (!EXT_RE.test(specifier)) {
    rel = rel.replace(EXT_RE, "");
  }
  return rel;
};

const indexFromLineColumn = (
  text: string,
  line: number,
  column: number
): number => {
  let currentLine = 1;
  let currentColumn = 1;
  for (let i = 0; i < text.length; i += 1) {
    if (currentLine === line && currentColumn === column) {
      return i;
    }
    if (text[i] === "\n") {
      currentLine += 1;
      currentColumn = 1;
    } else {
      currentColumn += 1;
    }
  }
  throw new DmaEnvironmentError(
    `Could not locate import at ${line}:${column} for rewrite.`
  );
};

export const replaceSpecifierAt = (
  sourceText: string,
  line: number,
  column: number,
  oldSpecifier: string,
  newSpecifier: string
): string => {
  let start = indexFromLineColumn(sourceText, line, column);
  if (
    sourceText[start] !== '"' &&
    sourceText[start] !== "'" &&
    start > 0 &&
    (sourceText[start - 1] === '"' || sourceText[start - 1] === "'")
  ) {
    start -= 1;
  }
  const quote = sourceText[start];
  if (quote !== '"' && quote !== "'") {
    throw new DmaEnvironmentError(
      `Expected string literal at ${line}:${column}, found ${JSON.stringify(quote)}.`
    );
  }
  const expected = `${quote}${oldSpecifier}${quote}`;
  const actual = sourceText.slice(start, start + expected.length);
  if (actual !== expected) {
    throw new DmaEnvironmentError(
      `Import specifier mismatch at ${line}:${column}: expected ${expected}, found ${JSON.stringify(actual)}.`
    );
  }
  return (
    sourceText.slice(0, start) +
    `${quote}${newSpecifier}${quote}` +
    sourceText.slice(start + expected.length)
  );
};
