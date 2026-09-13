import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { TimeOfDayDevSwitch } from '@/components/TimeOfDayDevSwitch'
import { ProvidersWrapper } from '@/components/providers-wrapper'
import './globals.css'

// Offline-safe font fallback – avoids external fetch to fonts.googleapis.com during build
// Keeps --font-display / --font-sans variables so Sakura/glass styling is unchanged; falls back to system fonts
const displayFont = { variable: '--font-display' } as const
const bodyFont = { variable: '--font-sans' } as const

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
  const isGithubPages = !!process.env.NEXT_PUBLIC_BASE_PATH
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} bg-background`}>
      <body className="bg-background font-sans antialiased">
        <ProvidersWrapper>
          {children}
          {process.env.NODE_ENV === 'development' && <TimeOfDayDevSwitch />}
        </ProvidersWrapper>
        {process.env.NODE_ENV === 'production' && !isGithubPages && <Analytics />}
      </body>
    </html>
  )
}
