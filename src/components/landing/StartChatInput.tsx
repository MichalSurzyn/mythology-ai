'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import MythologySelector from '@/components/chat/MythologySelector'
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

  // Wybierz losową mitologię na start
  useEffect(() => {
    if (mythologies.length > 0 && !selectedMythology) {
      const random = mythologies[Math.floor(Math.random() * mythologies.length)]
      setSelectedMythology(random.id)
    }
  }, [mythologies])

  // Pobierz bogów dla wybranej mitologii
  useEffect(() => {
    async function loadGods() {
      if (selectedMythology) {
        const fetchedGods = await getGodsByMythologyId(selectedMythology)
        setGods(fetchedGods)
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

    // Stwórz ID sesji
    const sessionId = `${selectedMythology}_${selectedGod || 'mythology'}`

    // Przekieruj do chat page z zapytaniem
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

  return (
    <div className="flex flex-col gap-6">
      {/* Input Area */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Zadaj pytanie o mitologię..."
            rows={3}
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={handleStart}
            disabled={!input.trim()}
            className="rounded-lg bg-amber-600 p-3 text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Rozpocznij rozmowę"
          >
            <Send size={24} />
          </button>
        </div>

        {/* Selektory pod inputem */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <MythologySelector
            mythologies={mythologies}
            currentMythologyId={selectedMythology}
            currentGodId={selectedGod}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>

      {/* Info */}
      <p className="text-center text-sm text-zinc-500">
        Rozpocznij rozmowę z mitologią lub wybierz konkretnego boga
      </p>
    </div>
  )
}
