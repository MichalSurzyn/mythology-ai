// src/app/page.tsx
import { getMythologies } from '@lib/supabase/queries/mythologies'
import HeroSection from '@/components/landing/HeroSection'
import StartChatInput from '@/components/landing/StartChatInput'
import ScrollDownIndicator from '@/components/landing/ScrollDownIndicator'
import React from 'react'

export const revalidate = 3600

export default async function LandingPage() {
  const mythologies = await getMythologies().catch(() => [])

  return (
    // ZMIANA: Usunięto h-screen, snap-y, overflow-hidden na rzecz min-h-screen i naturalnego flow
    <main className="flex min-h-screen w-full flex-col bg-black">
      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 bg-gradient-to-b from-black to-zinc-950">
        <HeroSection />
        <ScrollDownIndicator />
      </section>

      {/* Start Chat Input - naturalnie pod spodem */}
      <section className="relative h-screen w-full bg-black">
        <StartChatInput mythologies={mythologies} />
      </section>
    </main>
  )
}
