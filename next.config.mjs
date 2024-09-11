/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['preview.redd.it', 'external-preview.redd.it'], // Añade los dominios necesarios
  },
};

export default nextConfig;
