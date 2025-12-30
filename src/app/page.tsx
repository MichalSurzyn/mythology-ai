// src/app/page.tsx
import HeroSection from '@/components/landing/HeroSection'
import StartChatInput from '@/components/landing/StartChatInput'
import ScrollDownIndicator from '@/components/landing/ScrollDownIndicator'
import GalaxyThemed from '@/components/backgrounds/GalaxyThemed'
import React from 'react'

export const revalidate = 3600

export default function LandingPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      {/* TŁO GALAXY - Pozycjonowane absolutnie pod spodem */}
      <div className="absolute inset-0 z-0 min-h-[200vh] w-full overflow-hidden">
        <GalaxyThemed />
      </div>
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 bg-gradient-to-b from-black to-transparent z-10">
        <HeroSection />
        {/* <ScrollDownIndicator /> */}
      </section>

      {/* Start Chat Input - dane z Context */}
      <section className="relative h-screen w-full">
        <StartChatInput />
      </section>
    </main>
  )
}
