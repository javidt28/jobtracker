import type { NextConfig } from "next";

const outputStatic = process.env.OUTPUT_STATIC === "1";
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(outputStatic && { output: "export", trailingSlash: true }),
  ...(basePath && {
    basePath,
    assetPrefix: basePath ? `${basePath}/` : undefined,
  }),
};

export default nextConfig;
