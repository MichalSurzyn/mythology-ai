// src/app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'
import { getMythologiesWithGods } from '@lib/supabase/queries/mythologies'
import { ThemeProvider } from '@lib/contexts/ThemeContext'
import { Sidebar } from '@/components/Sidebar'
import Header from '@/components/layout/Header'
import UserButton from '@/components/auth/UserButton'
import './globals.css'
import React from 'react'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'MythChat',
  description: 'MythChat – eksploruj mitologie i bogów',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Pobierz mitologie + bogów RAZ dla całej aplikacji
  const mythologies = await getMythologiesWithGods().catch(() => [])

  // Stwórz colorMap: { mythId: color }
  const colorMap: Record<string, string> = {}
  mythologies.forEach((myth) => {
    colorMap[myth.id] = myth.theme_color
  })

  // Przygotuj uproszczoną strukturę dla Context
  const mythologiesForContext = mythologies.map((m) => ({
    id: m.id,
    name: m.name,
    theme_color: m.theme_color,
    gods: m.gods.map((g) => ({
      id: g.id,
      name: g.name,
      title: g.title,
      accent_color: g.accent_color,
    })),
  }))

  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen bg-black text-white`}
      >
        {/* ThemeProvider dostarcza kolory do wszystkich komponentów */}
        <ThemeProvider colorMap={colorMap} mythologies={mythologiesForContext}>
          <Header />
          <Sidebar mythologies={mythologies} />

          {/* UserButton - prawy górny róg */}
          <div className="fixed right-4 top-4 z-50">
            <UserButton />
          </div>

          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
