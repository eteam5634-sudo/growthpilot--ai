import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "cheerio"],
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
