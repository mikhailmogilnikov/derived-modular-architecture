import type { MetadataRoute } from "next";
import { appName, getSiteMeta, navBrandName } from "@/shared/model/app-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0a0a0a",
    description: getSiteMeta("en").description,
    display: "standalone",
    icons: [
      { sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "180x180", src: "/apple-icon", type: "image/png" },
    ],
    name: appName,
    short_name: navBrandName,
    start_url: "/",
    theme_color: "#0a0a0a",
  };
}
