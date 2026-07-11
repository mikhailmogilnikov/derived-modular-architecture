import { afterEach, describe, expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DMA_BEGIN, ensureAgentsMd } from "../../src/cli/init-agents";
import { ensurePackageScript } from "../../src/cli/init-package";
import { scaffoldProject } from "../../src/cli/init-scaffold";
import { parseCliArgs } from "../../src/cli/parse-args";
import { runCli } from "../../src/cli/run";

const INIT_FLAG_ERROR = /init does not accept/;

const temps: string[] = [];

const tempDir = (): string => {
  const dir = mkdtempSync(join(tmpdir(), "dma-init-"));
  temps.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

describe("parseCliArgs init", () => {
  test("parses init with path", () => {
    const args = parseCliArgs(["init", "/tmp/app"]);
    expect(args.command).toBe("init");
    expect(args.path).toBe("/tmp/app");
  });

  test("rejects analyze flags on init", () => {
    expect(() => parseCliArgs(["init", ".", "--format", "json"])).toThrow(
      INIT_FLAG_ERROR
    );
    expect(() => parseCliArgs(["init", ".", "--roots", "a"])).toThrow(
      INIT_FLAG_ERROR
    );
    expect(() => parseCliArgs(["init", ".", "--include-packages"])).toThrow(
      INIT_FLAG_ERROR
    );
  });
});

describe("scaffoldProject", () => {
  test("creates greenfield layout + config", async () => {
    const root = tempDir();
    const actions = await scaffoldProject({ projectRoot: root });
    expect(
      actions.some((a) => a.action === "created" && a.path.endsWith("src"))
    ).toBe(true);
    expect(
      actions.some((a) => a.action === "created" && a.path.endsWith("src/app"))
    ).toBe(true);
    expect(readFileSync(join(root, "dma.config.ts"), "utf8")).toContain(
      "defineConfig"
    );
  });

  test("does not create app when pages exists", async () => {
    const root = tempDir();
    mkdirSync(join(root, "src", "pages"), { recursive: true });
    const actions = await scaffoldProject({ projectRoot: root });
    expect(
      actions.some(
        (a) =>
          a.action === "skipped" &&
          a.path.endsWith("src/app") &&
          a.note?.includes("pages")
      )
    ).toBe(true);
    expect(actions.some((a) => a.path.endsWith("src/features"))).toBe(true);
  });

  test("skips config when dma.config.json exists", async () => {
    const root = tempDir();
    writeFileSync(join(root, "dma.config.json"), "{}\n");
    const actions = await scaffoldProject({ projectRoot: root });
    expect(
      actions.some(
        (a) => a.action === "skipped" && a.note?.includes("dma.config")
      )
    ).toBe(true);
  });
});

describe("ensurePackageScript", () => {
  test("warns when package.json missing", () => {
    const root = tempDir();
    const actions = ensurePackageScript(root);
    expect(actions[0]?.action).toBe("warned");
  });

  test("adds dma script once", () => {
    const root = tempDir();
    writeFileSync(
      join(root, "package.json"),
      '{\n  "name": "x",\n  "version": "1.0.0"\n}\n'
    );
    expect(ensurePackageScript(root)[0]?.action).toBe("created");
    const raw = readFileSync(join(root, "package.json"), "utf8");
    const pkg = JSON.parse(raw) as {
      name: string;
      scripts: { dma: string };
      version: string;
    };
    expect(pkg.scripts.dma).toBe("dma check .");
    expect(Object.keys(pkg)).toEqual(["name", "version", "scripts"]);
    expect(raw.endsWith("\n")).toBe(true);
    expect(ensurePackageScript(root)[0]?.action).toBe("skipped");
  });
});

describe("ensureAgentsMd", () => {
  test("creates and is idempotent via markers", () => {
    const root = tempDir();
    expect(ensureAgentsMd(root)[0]?.action).toBe("created");
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toContain(DMA_BEGIN);
    expect(ensureAgentsMd(root)[0]?.action).toBe("skipped");
  });

  test("appends to existing file without DMA", () => {
    const root = tempDir();
    writeFileSync(join(root, "AGENTS.md"), "# Existing\n\nKeep me.\n");
    expect(ensureAgentsMd(root)[0]?.action).toBe("appended");
    const content = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(content.startsWith("# Existing")).toBe(true);
    expect(content).toContain(DMA_BEGIN);
  });

  test("warns when DMA heading exists without markers", () => {
    const root = tempDir();
    writeFileSync(join(root, "AGENTS.md"), "## Something DMA related\n");
    expect(ensureAgentsMd(root)[0]?.action).toBe("warned");
  });
});

describe("runCli init", () => {
  test("idempotent full run exit 0", async () => {
    const root = tempDir();
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "demo" }));
    expect(await runCli(["init", root])).toBe(0);
    expect(await runCli(["init", root])).toBe(0);
  });
});
