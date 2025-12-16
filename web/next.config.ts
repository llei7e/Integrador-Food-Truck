const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['apexcharts', 'react-apexcharts', 'leaflet', 'react-leaflet'],
  },
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;