/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://joshspotmedia-backup-production.up.railway.app/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
