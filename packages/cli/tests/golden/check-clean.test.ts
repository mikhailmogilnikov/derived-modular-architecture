import { afterEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { runCli } from "../../src/cli/run";

const fixtureClean = join(import.meta.dir, "../fixtures/clean");

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

describe("golden check-clean", () => {
  let restore: (() => void) | undefined;

  afterEach(() => {
    restore?.();
    restore = undefined;
  });

  test("check clean fixture exits 0 with zero errors", () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = runCli(["check", fixtureClean, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      summary: { errors: number };
    };

    expect(code).toBe(0);
    expect(report.summary.errors).toBe(0);
  });
});
