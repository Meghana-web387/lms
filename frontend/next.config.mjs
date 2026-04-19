/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return [];
    }
    const target = process.env.API_INTERNAL_URL || "http://127.0.0.1:4000";
    return [{ source: "/api/:path*", destination: `${target}/api/:path*` }];
  },
};

export default nextConfig;
