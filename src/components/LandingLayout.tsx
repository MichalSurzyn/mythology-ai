'use client'

import TypingText from '@/components/TypingText'
import ChatInterface from '@/components/chat/ChatInterface'
import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface LandingLayoutProps {
  mythologies: any[]
}

export default function LandingLayout({ mythologies }: LandingLayoutProps) {
  const { scrollY } = useScroll()

  // Animacje na podstawie scrolla
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8])
  const heroY = useTransform(scrollY, [0, 300], [0, -100])

  const scrollToChat = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-zinc-950 text-white">
      {/* Hero Section - znika przy scrollu */}
      <motion.section
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{
          opacity: heroOpacity,
          scale: heroScale,
          y: heroY,
        }}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-zinc-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Witaj w
          </motion.p>

          <motion.h1
            className="text-5xl font-runewood tracking-tight text-white sm:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            MythChat
          </motion.h1>

          <TypingText
            text="Interaktywna strona internetowa o mitologii  integrująca model językowy"
            className="max-w-2xl font-Italianno text-5xl text-zinc-300"
            delay={1}
          />

          <motion.div
            className="mt-12 flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <p className="text-sm text-zinc-400">Rozpocznij rozmowę z czatem</p>
            <button
              onClick={scrollToChat}
              className="flex flex-col items-center gap-2 text-amber-500 transition hover:text-amber-400"
              aria-label="Scroll to chat"
            >
              <ChevronDown size={32} className="animate-bounce" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Chat Section - pojawia się po scrollu */}
      <section className="min-h-screen bg-black px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ChatInterface mythologies={mythologies} />
          </motion.div>
        </div>
      </section>
    </main>
  )
}
