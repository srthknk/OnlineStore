/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60000,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            }
        ]
    },
    compress: true,
    reactStrictMode: false,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    experimental: {
        optimizePackageImports: ["@reduxjs/toolkit", "lucide-react", "recharts"],
    },
    onDemandEntries: {
        maxInactiveAge: 60 * 60 * 1000,
        pagesBufferLength: 5,
    },
    allowedDevOrigins: [
        'localhost',
        '127.0.0.1',
        '192.168.31.184',
    ]
};

export default nextConfig;
