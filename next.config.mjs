/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains: ['lh3.googleusercontent.com'],
    },
    // Explicitly enable the path aliases defined in jsconfig.json
    experimental: {
        esmExternals: 'loose',
    }
};

export default nextConfig;
