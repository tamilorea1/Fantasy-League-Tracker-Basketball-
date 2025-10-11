/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      '@prisma/client': 'commonjs @prisma/client',
    });
    return config;
  },
};

export default nextConfig;