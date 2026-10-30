// Server-side only: where the Express API lives. The browser never sees this value.
const apiTarget = (process.env.API_PROXY_TARGET || "http://localhost:5000").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Proxy /api/* to Express so the browser talks to ONE origin. The HTTP-only auth cookie then stays
  // first-party/same-site and no CORS is involved. (Alternatively set NEXT_PUBLIC_API_BASE_URL to a
  // full API URL and configure CORS + SameSite on the server.)
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiTarget}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
