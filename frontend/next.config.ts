import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js dev mode blocks cross-origin requests (including the client-side
  // whoami fetch that drives the Navbar/Sidebar login state) from any origin
  // not explicitly allowlisted here — this is a DNS-rebinding protection, not
  // a bug, but it silently hangs requests made from anywhere other than
  // localhost. Add every LAN IP/hostname you test the app from.
  // "*.trycloudflare.com" covers Cloudflare Quick Tunnels, which mint a new
  // random subdomain on every restart — the wildcard means you don't have to
  // update this file each time you re-run the tunnel.
  allowedDevOrigins: ["26.26.2.15", "*.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8089",
        pathname: "/**",
      }
    ]
  },
  async rewrites() {
    // In Docker, the frontend and backend run in separate containers, so
    // "127.0.0.1" would point back at the frontend container itself.
    // BACKEND_INTERNAL_URL overrides this to the backend service's Docker
    // network hostname; local (non-Docker) dev keeps the existing default.
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8089";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
