import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import './globals.css'

const displayFont = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'NETHRA: Life-RPG',
  description:
    'Turn real-life activities into quests. Earn XP, level up your character, build attributes, and keep your streak alive in a cinematic Japanese fantasy world.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b1020',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} bg-background`}>
      <body className="bg-background font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
