import { getMythologies } from '@lib/supabase/queries/mythologies'
import HeroSection from '@/components/landing/HeroSection'
import StartChatInput from '@/components/landing/StartChatInput'
import ScrollDownIndicator from '@/components/landing/ScrollDownIndicator'
import React from 'react'

export const revalidate = 3600

export default async function LandingPage() {
  const mythologies = await getMythologies().catch(() => [])

  return (
    // Zmiany: h-screen, overflow-y-scroll, snap-y (scroll snapping), ukrywanie scrollbara
    <main className="h-screen w-full overflow-y-scroll scroll-smooth bg-black snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {/* Hero Section */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center px-6 snap-start bg-gradient-to-b from-black to-zinc-950">
        <HeroSection />
        <ScrollDownIndicator />
      </section>

      {/* Start Chat Input Section */}
      {/* Zmiany: usunięto paddingi ograniczające, sekcja zajmuje pełne okno */}
      <section className="relative h-screen w-full snap-start bg-black">
        <StartChatInput mythologies={mythologies} />
      </section>
    </main>
  )
}
