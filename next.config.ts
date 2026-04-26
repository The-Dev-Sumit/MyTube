import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // dev mein off
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // ✅ Google profile pics
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ✅ Cloudinary images
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com", // ✅ YouTube alternate CDN
      },
    ],
  },
};

export default pwaConfig(nextConfig);
