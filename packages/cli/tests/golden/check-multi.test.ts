import { afterEach, describe, expect, test } from "bun:test";
import { join, relative, resolve } from "node:path";
import { runCli } from "../../src/cli/run";

const fixtureMini = join(import.meta.dir, "../fixtures/mini-monorepo");
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

describe("golden check-multi", () => {
  let restore: (() => void) | undefined;

  afterEach(() => {
    restore?.();
    restore = undefined;
  });

  test("check monorepo root finds apps and fails on dirty admin", () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = runCli(["check", fixtureMini, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      projects?: string[];
      summary: { errors: number };
      diagnostics: Array<{ project?: string; ruleId: string }>;
    };

    expect(code).toBe(1);
    expect(report.projects).toHaveLength(2);
    expect(report.summary.errors).toBeGreaterThan(0);
    expect(
      report.diagnostics.some(
        (d) =>
          d.ruleId === "feature-to-feature" && d.project?.endsWith("apps/admin")
      )
    ).toBe(true);
  });

  test("include-packages adds cart root", () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = runCli([
      "check",
      fixtureMini,
      "--include-packages",
      "--format",
      "json",
    ]);
    const report = JSON.parse(captured.chunks.join("")) as {
      projects?: string[];
    };

    expect(code).toBe(1);
    expect(report.projects).toHaveLength(3);
    expect(
      report.projects?.some((project) => project.endsWith("packages/cart"))
    ).toBe(true);
  });

  test("single --roots uses single-root json shape", () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const web = join(fixtureMini, "apps/web");
    const code = runCli(["check", "--roots", web, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      projects?: string[];
      diagnostics: Array<{ project?: string }>;
      summary: { errors: number };
    };

    expect(code).toBe(0);
    expect(report.projects).toBeUndefined();
    expect(report.diagnostics.every((d) => d.project === undefined)).toBe(true);
    expect(report.summary.errors).toBe(0);
  });

  test("human multi includes root banners", () => {
    process.env.NO_COLOR = "1";
    const captured = captureStdout();
    ({ restore } = captured);

    try {
      const code = runCli(["check", fixtureMini, "--format", "human"]);
      const out = captured.chunks.join("");
      expect(code).toBe(1);
      expect(out).toContain("Checking 2 roots");
      expect(out).toContain("── ");
      expect(out).toContain("apps/admin");
      expect(out).toContain("apps/web");
    } finally {
      delete process.env.NO_COLOR;
    }
  });

  test("single-root clean still omits projects field", () => {
    const captured = captureStdout();
    ({ restore } = captured);

    const code = runCli(["check", fixtureClean, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      projects?: string[];
      summary: { errors: number };
    };

    expect(code).toBe(0);
    expect(report.projects).toBeUndefined();
    expect(report.summary.errors).toBe(0);
  });

  test("bad --roots exits 2", () => {
    const err = captureStderr();
    const out = captureStdout();
    restore = () => {
      err.restore();
      out.restore();
    };

    const code = runCli(["check", "--roots", fixtureMini, "--format", "json"]);
    expect(code).toBe(2);
    expect(err.chunks.join("")).toContain("src/ not found");
  });

  test("relative project labels are stable", () => {
    const captured = captureStdout();
    ({ restore } = captured);

    runCli(["check", fixtureMini, "--format", "json"]);
    const report = JSON.parse(captured.chunks.join("")) as {
      projects: string[];
    };
    const expected = [
      relative(process.cwd(), resolve(fixtureMini, "apps/admin"))
        .split("\\")
        .join("/"),
      relative(process.cwd(), resolve(fixtureMini, "apps/web"))
        .split("\\")
        .join("/"),
    ].sort((a, b) => a.localeCompare(b));
    expect(report.projects).toEqual(expected);
  });
});
