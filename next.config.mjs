/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60000,
        remotePatterns: [
            // ImageKit domain
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
            },
            // Unsplash domain
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            // dfordelhi domain
            {
                protocol: 'https',
                hostname: 'dfordelhi.in',
            },
            // Broad wildcard for any HTTPS domain
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
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
        '10.81.154.200',
    ]
};

export default nextConfig;
