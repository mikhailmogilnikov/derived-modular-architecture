import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  allowedDevOrigins: ["192.168.1.34"],
  reactStrictMode: true,
  transpilePackages: ["geist"],
};

export default withMDX(config);
