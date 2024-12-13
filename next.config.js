/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    basePath: process.env.NEXT_PUBLIC_BASE_URL,
    trailingSlash: true,
};

const withNextIntl = require("next-intl/plugin")();
module.exports = withNextIntl(nextConfig);
