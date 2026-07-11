import { ImageResponse } from "next/og";

export const size = { height: 180, width: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0a0a0a",
        borderRadius: 40,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <svg
        fill="none"
        height="112"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
        width="112"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Layers</title>
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      </svg>
    </div>,
    size
  );
}
