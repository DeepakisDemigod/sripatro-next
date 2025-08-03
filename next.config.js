/*const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} 
const nextConfig = {};
 
module.exports = withNextIntl(nextConfig);
*/

const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "cdn.weatherapi.com",
        pathname: "/weather/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/id/**",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
