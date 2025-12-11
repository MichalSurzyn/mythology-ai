'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'
import MythologySelector from '@/components/chat/MythologySelector'
import { useTheme } from '@lib/contexts/ThemeContext'
import React from 'react'

export default function StartChatInput() {
  const router = useRouter()
  const { setAccent, mythologies } = useTheme() // ✅ Dane z Context!
  const [input, setInput] = useState('')
  const [selectedMythology, setSelectedMythology] = useState('')
  const [selectedGod, setSelectedGod] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Wybierz losową mitologię na start
  useEffect(() => {
    if (mythologies.length > 0 && !selectedMythology) {
      const random = mythologies[Math.floor(Math.random() * mythologies.length)]
      setSelectedMythology(random.id)
      // Ustaw kolor losowej mitologii
      setAccent(random.id, null)
    }
  }, [mythologies, selectedMythology, setAccent])

  // Intersection observer dla animacji
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleSelectionChange = async (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => {
    setSelectedMythology(mythologyId)
    setSelectedGod(godId)
    // Zmień kolor akcentu natychmiast
    await setAccent(mythologyId, godId)
  }

  const handleStart = () => {
    if (!input.trim()) return
    const sessionId = `${selectedMythology}_${selectedGod || 'mythology'}`
    const params = new URLSearchParams({
      q: input.trim(),
      mythology: selectedMythology,
      ...(selectedGod && { god: selectedGod }),
    })
    router.push(`/chat/${sessionId}?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleStart()
    }
  }

  // Znajdź aktualną mitologię i boga z Context
  const currentMythology = mythologies.find((m) => m.id === selectedMythology)
  const currentGod = currentMythology?.gods.find((g) => g.id === selectedGod)

  const greetingMessage =
    selectedGod && currentGod
      ? `Witaj, śmiertelniku. Jestem ${currentGod.name}. Czego pragniesz ode mnie?`
      : currentMythology
      ? `Witaj w świecie ${currentMythology.name}. O czym chcesz się dowiedzieć?`
      : ''

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex h-full w-full flex-col justify-end"
    >
      {/* Greeting Message */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
        {greetingMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
            }
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-4xl text-center"
          >
            <h2 className="font-Italianno text-6xl text-accent/90 drop-shadow-lg sm:text-7xl">
              {greetingMessage}
            </h2>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="w-full border-t border-zinc-800 bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 p-6 sm:p-8">
          <div className="flex gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Zadaj pytanie..."
              rows={1}
              className="flex-1 resize-none px-2 py-3 text-xl text-white placeholder-zinc-600 focus:outline-none focus:placeholder-zinc-700"
              style={{ minHeight: '60px' }}
            />
            <button
              onClick={handleStart}
              disabled={!input.trim()}
              className="self-end rounded-full bg-accent p-4 text-black transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={24} />
            </button>
          </div>

          {/* Selektory */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mr-4 hidden sm:block">
              Konfiguracja sesji
            </div>
            <MythologySelector
              currentMythologyId={selectedMythology}
              currentGodId={selectedGod}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
