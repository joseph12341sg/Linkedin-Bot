/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle puppeteer - it's optional and loaded at runtime
      config.externals = config.externals || []
      config.externals.push('puppeteer')
    }
    return config
  },
}

module.exports = nextConfig
