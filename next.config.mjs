/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['preview.redd.it', 'external-preview.redd.it', 
    'styles.redditmedia.com', 'b.thumbs.redditmedia.com', 
    'www.redditstatic.com', 'i.redd.it'], // Añade los dominios necesarios
  },
};

export default nextConfig;
