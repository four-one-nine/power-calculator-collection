/** @type {import('next').NextConfig} */
const nextConfig = (phase, { defaultConfig }) => {
  const isProd = phase === 'production';
  return {
    basePath: isProd ? '/power-calculator-collection' : '',
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  };
};

module.exports = nextConfig;
