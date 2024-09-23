/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'preview.redd.it',
      },
      {
        protocol: 'https',
        hostname: 'external-preview.redd.it',
      },
      {
        protocol: 'https',
        hostname: 'styles.redditmedia.com',
      },
      {
        protocol: 'https',
        hostname: 'b.thumbs.redditmedia.com',
      },
      {
        protocol: 'https',
        hostname: 'www.redditstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'i.redd.it',
      },
    ], // Añade los dominios necesarios
  },
  experimental: {
    scrollRestoration: false,
  },
};

export default nextConfig;
