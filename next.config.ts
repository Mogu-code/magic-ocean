/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: __dirname, // tells Next to use the correct folder
    },
  },
};

export default nextConfig;
