/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true'

const basePath = '/NETHRA--Life-RPG-Application'

const nextConfig = {
  ...(isGithubPages ? { output: 'export' } : {}),
  ...(isGithubPages ? { basePath } : {}),
  ...(isGithubPages ? { assetPrefix: `${basePath}/` } : {}),
  ...(isGithubPages ? { trailingSlash: true } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? basePath : '',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
