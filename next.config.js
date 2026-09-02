/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["mysql2"],
  experimental: {
    // Handbook attachment uploads (PDF) go through a Server Action.
    serverActions: { bodySizeLimit: "12mb" },
  },
};
module.exports = nextConfig;
