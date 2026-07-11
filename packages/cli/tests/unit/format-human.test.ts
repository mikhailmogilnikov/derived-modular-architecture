import { describe, expect, test } from "bun:test";
import { formatHuman } from "../../src/cli/format-human";
import type { Diagnostic } from "../../src/core/types";

describe("formatHuman", () => {
  test("renders clean check without ansi escape codes when not a tty", () => {
    const prev = process.env.FORCE_COLOR;
    process.env.NO_COLOR = "1";
    delete process.env.FORCE_COLOR;
    try {
      const out = formatHuman("check", []);
      expect(out).toContain("check passed");
      expect(out).not.toContain("\u001B[");
    } finally {
      delete process.env.NO_COLOR;
      if (prev !== undefined) {
        process.env.FORCE_COLOR = prev;
      }
    }
  });

  test("groups diagnostics with help and summary", () => {
    process.env.NO_COLOR = "1";
    try {
      const diagnostics: Diagnostic[] = [
        {
          file: "/tmp/a.ts",
          help: "Promote to services/",
          message: 'Feature "a" imports feature "b"',
          range: { column: 10, line: 1 },
          ruleId: "feature-to-feature",
          severity: "error",
        },
        {
          file: "/tmp/b.ts",
          message: "File is imported by 2 other modules",
          ruleId: "shared-candidate",
          severity: "warning",
        },
      ];
      const out = formatHuman("check", diagnostics);
      expect(out).toContain("error feature-to-feature");
      expect(out).toContain("warn shared-candidate");
      expect(out).toContain("→ Promote to services/");
      expect(out).toContain("1 error");
      expect(out).toContain("1 warning");
    } finally {
      delete process.env.NO_COLOR;
    }
  });

  test("multi-root banners and footer", () => {
    process.env.NO_COLOR = "1";
    try {
      const diagnostics: Diagnostic[] = [
        {
          message: "bad",
          project: "apps/admin",
          ruleId: "feature-to-feature",
          severity: "error",
        },
      ];
      const out = formatHuman("check", diagnostics, {
        projects: ["apps/admin", "apps/web"],
      });
      expect(out).toContain("Checking 2 roots");
      expect(out).toContain("── apps/admin ──");
      expect(out).toContain("── apps/web ──");
      expect(out).toContain("ok");
      expect(out).toContain("2 roots · 1 error");
    } finally {
      delete process.env.NO_COLOR;
    }
  });
});
