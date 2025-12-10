import { Geist, Geist_Mono } from 'next/font/google'
import { getMythologiesWithGods } from '@lib/supabase/queries/mythologies'
import { Sidebar } from '@/components/Sidebar'
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
  const mythologies = await getMythologiesWithGods().catch(() => [])

  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
        <Sidebar mythologies={mythologies} />

        {/* UserButton - prawy górny róg */}
        <div className="fixed right-4 top-4 z-50">
          <UserButton />
        </div>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
