/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals = config.externals || {}
    config.externals['@mapbox/node-pre-gyp'] = '@mapbox/node-pre-gyp'
    config.externals['pg'] = 'pg'
    config.externals['bcrypt'] = 'bcrypt'
    return config
  },
};

export default nextConfig;
