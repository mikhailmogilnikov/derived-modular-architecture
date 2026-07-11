import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { DEFAULT_DMA_CONFIG } from "../core/config-types";
import { CONFIG_FILENAMES, loadConfigFile } from "../core/load-config";
import type { InitAction } from "./init-types";

const CONFIG_TEMPLATE = `import { defineConfig } from "@derived-modular/cli";

export default defineConfig({});
`;

const isDirectory = (path: string): boolean =>
  existsSync(path) && statSync(path).isDirectory();

const ensureDir = (dir: string, actions: InitAction[]): void => {
  if (existsSync(dir)) {
    actions.push({ action: "skipped", note: "already exists", path: dir });
    return;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, ".gitkeep"), "");
  actions.push({ action: "created", path: dir });
};

const localConfigPath = (projectRoot: string): string | undefined => {
  for (const name of CONFIG_FILENAMES) {
    const candidate = join(projectRoot, name);
    if (existsSync(candidate)) {
      return candidate;
    }
  }
};

/** Prefer JSON for srcRoot; avoid jiti (package may not resolve yet). */
const readLocalSrcRoot = (configPath: string): string => {
  if (!configPath.toLowerCase().endsWith(".json")) {
    return DEFAULT_DMA_CONFIG.srcRoot;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(configPath, "utf8"));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "srcRoot" in parsed &&
      typeof (parsed as { srcRoot: unknown }).srcRoot === "string" &&
      (parsed as { srcRoot: string }).srcRoot.length > 0
    ) {
      return (parsed as { srcRoot: string }).srcRoot;
    }
  } catch {
    // fall through
  }
  return DEFAULT_DMA_CONFIG.srcRoot;
};

export interface ScaffoldOptions {
  config?: string;
  projectRoot: string;
}

export const scaffoldProject = async (
  options: ScaffoldOptions
): Promise<InitAction[]> => {
  const projectRoot = resolve(options.projectRoot);
  const actions: InitAction[] = [];

  const { srcRoot: defaultSrcRoot } = DEFAULT_DMA_CONFIG;
  let srcRoot: string = defaultSrcRoot;
  const existingLocal = localConfigPath(projectRoot);

  if (options.config !== undefined) {
    const absolute = isAbsolute(options.config)
      ? options.config
      : resolve(options.config);
    const loaded = await loadConfigFile(absolute);
    const { srcRoot: fromConfig } = loaded.config;
    if (fromConfig !== undefined) {
      srcRoot = fromConfig;
    }
  } else if (existingLocal !== undefined) {
    srcRoot = readLocalSrcRoot(existingLocal);
  }

  const srcDir = join(projectRoot, srcRoot);
  ensureDir(srcDir, actions);

  const hasPages = isDirectory(join(srcDir, "pages"));
  const hasRoutes = isDirectory(join(srcDir, "routes"));

  if (hasPages || hasRoutes) {
    actions.push({
      action: "skipped",
      note: "composition root already present (pages/ or routes/)",
      path: join(srcDir, "app"),
    });
  } else {
    ensureDir(join(srcDir, "app"), actions);
  }

  ensureDir(join(srcDir, "features"), actions);
  ensureDir(join(srcDir, "shared"), actions);

  if (existingLocal === undefined) {
    const configPath = join(projectRoot, "dma.config.ts");
    writeFileSync(configPath, CONFIG_TEMPLATE);
    actions.push({ action: "created", path: configPath });
  } else {
    actions.push({
      action: "skipped",
      note: "dma.config already exists",
      path: existingLocal,
    });
  }

  return actions;
};
