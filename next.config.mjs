/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  ...(isGithubPages ? { output: 'export' } : {}),
  ...(isGithubPages ? { basePath: '/NETHRA--Life-RPG-Application' } : {}),
  ...(isGithubPages ? { assetPrefix: '/NETHRA--Life-RPG-Application/' } : {}),
  ...(isGithubPages ? { trailingSlash: true } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
