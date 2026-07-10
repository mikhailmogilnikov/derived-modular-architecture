import { relative, sep } from "node:path";

export const isUnderDir = (filePath: string, dirPath: string): boolean => {
  const rel = relative(dirPath, filePath);
  return rel !== "" && !rel.startsWith(`..${sep}`) && !rel.startsWith("..");
};

export const relativeSegments = (
  filePath: string,
  rootPath: string
): string[] | null => {
  const rel = relative(rootPath, filePath);
  if (!rel || rel.startsWith(`..${sep}`) || rel.startsWith("..")) {
    return null;
  }
  return rel.split(sep).filter(Boolean);
};

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
  ".vue",
  ".svelte",
  ".astro",
  ".md",
  ".mdx",
]);

export const stripSourceExtension = (filename: string): string => {
  const lower = filename.toLowerCase();
  for (const ext of SOURCE_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return filename.slice(0, -ext.length);
    }
  }
  return filename;
};

export const hasSourceExtension = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  for (const ext of SOURCE_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return true;
    }
  }
  return false;
};
