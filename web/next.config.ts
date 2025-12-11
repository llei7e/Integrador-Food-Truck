import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['apexcharts', 'react-apexcharts', 'leaflet', 'react-leaflet'],
  },
};

module.exports = nextConfig;