/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Turbopack crashes with non-ASCII characters in the file path on Windows */
  experimental: {
    turbopack: false,
  },
};

module.exports = nextConfig;
