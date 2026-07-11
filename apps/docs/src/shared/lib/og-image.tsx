import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const FONT_SUBPATH = "geist/dist/fonts/geist-sans";

const fontBaseDirs = [
  join(process.cwd(), "node_modules", FONT_SUBPATH),
  join(process.cwd(), "..", "..", "node_modules", FONT_SUBPATH),
];

const loadFont = (file: string): Buffer => {
  for (const dir of fontBaseDirs) {
    const path = join(dir, file);
    if (existsSync(path)) {
      return readFileSync(path);
    }
  }
  throw new Error(`Font not found: ${file}`);
};

const fonts = [
  { data: loadFont("Geist-Regular.ttf"), name: "Geist", weight: 400 as const },
  { data: loadFont("Geist-Medium.ttf"), name: "Geist", weight: 500 as const },
  {
    data: loadFont("Geist-SemiBold.ttf"),
    name: "Geist",
    weight: 600 as const,
  },
];

const ACCENT = "#a3e635";

interface OgImageOptions {
  description: string;
  eyebrow: string;
  title: string;
}

export function renderOgImage({ title, description, eyebrow }: OgImageOptions) {
  return new ImageResponse(
    <div
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        position: "relative",
        width: "100%",
      }}
    >
      <svg
        aria-label="Layers"
        fill="none"
        height="760"
        role="img"
        style={{ position: "absolute", right: "-140px", top: "-70px" }}
        viewBox="0 0 300 300"
        width="760"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          opacity="0.08"
          stroke="#ffffff"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M150 86 262 130 150 174 38 130Z" />
          <path d="M150 126 262 170 150 214 38 170Z" />
        </g>
        <g
          opacity="0.28"
          stroke={ACCENT}
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M150 46 262 90 150 134 38 90Z" />
        </g>
      </svg>
      <div style={{ alignItems: "center", display: "flex", gap: "18px" }}>
        <svg
          aria-label="Logo"
          fill="none"
          height="40"
          role="img"
          stroke={ACCENT}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
          width="40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
          <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        </svg>
        <span
          style={{
            color: "#a1a1a1",
            fontSize: "28px",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {eyebrow}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <div
          style={{
            display: "flex",
            fontSize: "76px",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            maxWidth: "980px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#8f8f8f",
            display: "flex",
            fontSize: "34px",
            fontWeight: 400,
            lineHeight: 1.35,
            maxWidth: "900px",
          }}
        >
          {description}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            background: `linear-gradient(90deg, ${ACCENT}, rgba(163,230,53,0))`,
            borderRadius: "9999px",
            display: "flex",
            height: "4px",
            width: "160px",
          }}
        />
        <span style={{ color: "#6b6b6b", fontSize: "26px", fontWeight: 400 }}>
          derived-modular.vercel.app
        </span>
      </div>
    </div>,
    {
      fonts,
      height: 630,
      width: 1200,
    }
  );
}
