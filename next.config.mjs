import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
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
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
    ],
  },
  experimental: {
    scrollRestoration: true,
  },
};

// Exporta la configuración combinada con el analizador de paquetes
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
