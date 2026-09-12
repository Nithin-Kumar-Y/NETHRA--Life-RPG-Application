import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import { Petals } from '@/components/environment/petals'
import { TopNav } from '@/components/dashboard/top-nav'
import { FloatingNav } from '@/components/navigation/floating-nav'
import { GameProvider } from '@/components/game-provider'
import { VillageGate } from '@/components/onboarding/village-gate'
import { TimeOfDayDevSwitch } from '@/components/TimeOfDayDevSwitch'
import { TimeOfDayProvider } from '@/components/time-of-day-provider'
import { WorldBackground } from '@/components/WorldBackground'
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
        <TimeOfDayProvider>
          <GameProvider>
            <WorldBackground />
            <Petals />
            <div className="relative min-h-screen">
              <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:pl-24">
                <TopNav />
                {children}
              </div>
              <FloatingNav />
              <VillageGate />
              {process.env.NODE_ENV === 'development' && <TimeOfDayDevSwitch />}
            </div>
          </GameProvider>
        </TimeOfDayProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
