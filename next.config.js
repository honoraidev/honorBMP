/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["mysql2"],
};
module.exports = nextConfig;
