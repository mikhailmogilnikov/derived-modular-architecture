const TS_LIKE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mts",
  ".cts",
] as const;
const SFC_EXTENSIONS = [".vue", ".astro", ".svelte"] as const;

export const SOURCE_EXTENSIONS = [
  ...TS_LIKE_EXTENSIONS,
  ...SFC_EXTENSIONS,
] as const;

export const INDEX_FILES = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "index.mts",
  "index.cts",
  "index.vue",
  "index.astro",
  "index.svelte",
] as const;

const SOURCE_EXTENSION_SET = new Set<string>(SOURCE_EXTENSIONS);
const SFC_EXTENSION_SET = new Set<string>(SFC_EXTENSIONS);

export const isSourceFileName = (name: string): boolean => {
  if (
    name.endsWith(".d.ts") ||
    name.endsWith(".d.mts") ||
    name.endsWith(".d.cts")
  ) {
    return false;
  }
  const dot = name.lastIndexOf(".");
  if (dot === -1) {
    return false;
  }
  return SOURCE_EXTENSION_SET.has(name.slice(dot).toLowerCase());
};

export const isSfcFilePath = (filePath: string): boolean => {
  const lower = filePath.toLowerCase();
  for (const ext of SFC_EXTENSION_SET) {
    if (lower.endsWith(ext)) {
      return true;
    }
  }
  return false;
};
