// src/components/layout/Header.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  // Na innych stronach widoczny zawsze, na Home startuje ukryty
  const [isVisible, setIsVisible] = useState(!isHomePage)

  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true)
      return
    }

    // Logika tylko dla strony głównej
    const handleScroll = () => {
      // Pokaż header gdy użytkownik przewinie 300px (wysokość Hero)
      const show = window.scrollY > 300
      setIsVisible(show)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 z-50 flex w-full items-center justify-center border-b border-zinc-900/50 bg-black/80 py-4 backdrop-blur-md"
        >
          <Link href="/">
            {/* Używamy tej samej czcionki co w Hero, ale mniejszej */}
            <h1 className="font-runewood text-2xl tracking-tight text-white hover:text-amber-500 transition-colors cursor-pointer">
              MythChat
            </h1>
          </Link>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
