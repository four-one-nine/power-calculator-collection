/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/power-calculator-collection',
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
