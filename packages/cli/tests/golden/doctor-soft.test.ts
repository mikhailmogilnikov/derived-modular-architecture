import { afterEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { runCli } from "../../src/cli/run";

const fixture = join(import.meta.dir, "../fixtures/stage-growth-0");

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

describe("golden doctor-soft", () => {
  let restore: (() => void) | undefined;

  afterEach(() => {
    restore?.();
    restore = undefined;
  });

  test("doctor exits 0 even with stage-growth warnings", () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = runCli(["doctor", fixture, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      diagnostics: { ruleId: string; severity: string }[];
      summary: { errors: number; warnings: number };
    };

    expect(code).toBe(0);
    expect(report.summary.errors).toBe(0);
    expect(report.summary.warnings).toBeGreaterThan(0);
    expect(report.diagnostics.some((d) => d.ruleId === "stage-growth")).toBe(
      true
    );
    expect(report.diagnostics.every((d) => d.severity !== "error")).toBe(true);
  });
});
