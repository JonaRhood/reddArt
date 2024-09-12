/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['preview.redd.it', 'external-preview.redd.it', 'styles.redditmedia.com', 'b.thumbs.redditmedia.com'], // Añade los dominios necesarios
  },
};

export default nextConfig;
