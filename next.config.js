/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    basePath: "/kost",
};

const withNextIntl = require("next-intl/plugin")();
module.exports = withNextIntl(nextConfig);
