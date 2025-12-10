'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'
import MythologySelector from '@/components/chat/MythologySelector'
import { getMythologyById } from '@lib/supabase/queries/mythologies'
import { getGodsByMythologyId } from '@lib/supabase/queries/gods'
import React from 'react'

interface StartChatInputProps {
  mythologies: any[]
}

export default function StartChatInput({ mythologies }: StartChatInputProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [selectedMythology, setSelectedMythology] = useState('')
  const [selectedGod, setSelectedGod] = useState<string | null>(null)
  const [gods, setGods] = useState<any[]>([])
  const [mythology, setMythology] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mythologies.length > 0 && !selectedMythology) {
      const random = mythologies[Math.floor(Math.random() * mythologies.length)]
      setSelectedMythology(random.id)
      setMythology(random)
    }
  }, [mythologies])

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

  useEffect(() => {
    async function loadGods() {
      if (selectedMythology) {
        const fetchedGods = await getGodsByMythologyId(selectedMythology)
        setGods(fetchedGods)
        const mythData = await getMythologyById(selectedMythology)
        setMythology(mythData)
      }
    }
    loadGods()
  }, [selectedMythology])

  const handleSelectionChange = (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => {
    setSelectedMythology(mythologyId)
    setSelectedGod(godId)
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

  const greetingMessage =
    selectedGod && gods.length > 0
      ? (() => {
          const god = gods.find((g) => g.id === selectedGod)
          return `Witaj, śmiertelniku. Jestem ${god?.name}. Czego pragniesz ode mnie?`
        })()
      : mythology
      ? `Witaj w świecie ${mythology.name}. O czym chcesz się dowiedzieć?`
      : ''

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      // ZMIANA: Pełna wysokość, czarne tło, flex layout z elementami na dole
      className="flex h-full w-full flex-col justify-end bg-black"
    >
      {/* Greeting Message - Wyśrodkowany w dostępnej przestrzeni powyżej inputu */}
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
            <h2 className="font-Italianno text-6xl text-amber-500/90 drop-shadow-lg sm:text-7xl">
              {greetingMessage}
            </h2>
          </motion.div>
        )}
      </div>

      {/* Input Area - Przyklejony do dołu, pełna szerokość */}
      <div className="w-full border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 p-6 sm:p-8">
          <div className="flex gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Zadaj pytanie..."
              rows={1}
              // ZMIANA: Styl "minimalistyczny", bez ramek, wygląda jak linia terminala
              className="flex-1 resize-none bg-transparent px-2 py-3 text-xl text-white placeholder-zinc-600 focus:outline-none focus:placeholder-zinc-700"
              style={{ minHeight: '60px' }}
            />
            <button
              onClick={handleStart}
              disabled={!input.trim()}
              className="self-end rounded-full bg-amber-600 p-4 text-white transition hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={24} />
            </button>
          </div>

          {/* Selektory pod inputem */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mr-4 hidden sm:block">
              Konfiguracja sesji
            </div>
            <MythologySelector
              mythologies={mythologies}
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
