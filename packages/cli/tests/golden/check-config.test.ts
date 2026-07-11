import { afterEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { runCli } from "../../src/cli/run";

const customSrc = join(import.meta.dir, "../fixtures/custom-src-root");
const configMonorepo = join(import.meta.dir, "../fixtures/config-monorepo");
const miniMonorepo = join(import.meta.dir, "../fixtures/mini-monorepo");
const includeOnlyConfig = join(
  import.meta.dir,
  "../fixtures/config-include-only/dma.config.json"
);
const invalid = join(import.meta.dir, "../fixtures/config-invalid");

const captureStdout = (): { chunks: string[]; restore: () => void } => {
  const chunks: string[] = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(
      typeof chunk === "string" ? chunk : Buffer.from(chunk).toString()
    );
    return true;
  }) as typeof process.stdout.write;
  return {
    chunks,
    restore: () => {
      process.stdout.write = original;
    },
  };
};

const captureStderr = (): { chunks: string[]; restore: () => void } => {
  const chunks: string[] = [];
  const original = process.stderr.write.bind(process.stderr);
  process.stderr.write = ((chunk: string | Uint8Array) => {
    chunks.push(
      typeof chunk === "string" ? chunk : Buffer.from(chunk).toString()
    );
    return true;
  }) as typeof process.stderr.write;
  return {
    chunks,
    restore: () => {
      process.stderr.write = original;
    },
  };
};

describe("golden check-config", () => {
  let restore: (() => void) | undefined;

  afterEach(() => {
    restore?.();
    restore = undefined;
  });

  test("custom srcRoot and compositionRoots", async () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = await runCli(["check", customSrc, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      summary: { errors: number };
    };
    expect(code).toBe(0);
    expect(report.summary.errors).toBe(0);
  });

  test("config roots limits to apps/web", async () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = await runCli(["check", configMonorepo, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      projects?: string[];
      summary: { errors: number };
    };

    // only apps/web → single-root shape, clean
    expect(code).toBe(0);
    expect(report.projects).toBeUndefined();
    expect(report.summary.errors).toBe(0);
  });

  test("config includePackages via --config", async () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = await runCli([
      "check",
      miniMonorepo,
      "--config",
      includeOnlyConfig,
      "--format",
      "json",
    ]);
    const report = JSON.parse(captured.chunks.join("")) as {
      projects?: string[];
    };

    expect(code).toBe(1);
    expect(report.projects).toHaveLength(3);
  });

  test("invalid config exits 2", async () => {
    const err = captureStderr();
    const out = captureStdout();
    restore = () => {
      err.restore();
      out.restore();
    };

    const code = await runCli(["check", invalid, "--format", "json"]);
    expect(code).toBe(2);
    expect(err.chunks.join("")).toContain("unknown key");
  });
});
