import { getMythologies } from '@lib/supabase/queries/mythologies'
import HeroSection from '@/components/landing/HeroSection'
import StartChatInput from '@/components/landing/StartChatInput'
import React from 'react'

export const revalidate = 3600

export default async function LandingPage() {
  const mythologies = await getMythologies().catch(() => [])

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-black to-zinc-950">
      {/* Hero Section */}
      <HeroSection />

      {/* Start Chat Input */}
      <section className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-3xl">
          <StartChatInput mythologies={mythologies} />
        </div>
      </section>
    </main>
  )
}
