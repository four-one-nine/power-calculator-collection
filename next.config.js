/** @type {import('next').NextConfig} */
<<<<<<< HEAD
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
=======
const nextConfig = {
  output: 'export',
  basePath: '/power-calculator-collection',
  images: {
    unoptimized: true,
  },
>>>>>>> 595905b607a1b20116f97005f6ba02373c7de134
};

module.exports = nextConfig;
