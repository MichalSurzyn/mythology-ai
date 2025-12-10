'use client'

import { motion } from 'framer-motion'
import TypingText from '@/components/TypingText'
import React from 'react'

export default function HeroSection() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24">
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
      </div>
    </section>
  )
}
