import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow the sandbox preview proxy origin to load dev assets without warnings.
  allowedDevOrigins: ["*.space-z.ai", "*.z.ai"],
  // V7: type errors are fixed, not ignored. Release gates run `tsc --noEmit`
  // (see package.json "typecheck") and the build enforces types again.
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
