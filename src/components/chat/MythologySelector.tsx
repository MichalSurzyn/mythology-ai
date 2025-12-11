'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { getGodsByMythologyId } from '@lib/supabase/queries/gods'
import React from 'react'

interface MythologySelectorProps {
  mythologies: any[]
  currentMythologyId: string
  currentGodId: string | null
  onSelectionChange: (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => void
}

export default function MythologySelector({
  mythologies,
  currentMythologyId,
  currentGodId,
  onSelectionChange,
}: MythologySelectorProps) {
  const [selectedMythology, setSelectedMythology] = useState(currentMythologyId)
  const [gods, setGods] = useState<any[]>([])
  const [selectedGod, setSelectedGod] = useState<string | null>(currentGodId)

  // Synchronizuj gdy zmieni się currentMythologyId z rodzica
  useEffect(() => {
    if (currentMythologyId && currentMythologyId !== selectedMythology) {
      setSelectedMythology(currentMythologyId)
      setSelectedGod(null)
    }
  }, [currentMythologyId])

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

  const handleMythologyChange = (mythologyId: string) => {
    setSelectedMythology(mythologyId)
    setSelectedGod(null) // Reset boga przy zmianie mitologii

    const mythology = mythologies.find((m) => m.id === mythologyId)
    onSelectionChange(mythologyId, mythology?.name || '', null, null)
  }

  const handleGodChange = (godId: string) => {
    const god = gods.find((g) => g.id === godId)

    if (godId === 'mythology') {
      // Tryb mitologii (bez boga)
      setSelectedGod(null)
      const mythology = mythologies.find((m) => m.id === selectedMythology)
      onSelectionChange(selectedMythology, mythology?.name || '', null, null)
    } else {
      // Tryb boga
      setSelectedGod(godId)
      const mythology = mythologies.find((m) => m.id === selectedMythology)
      onSelectionChange(
        selectedMythology,
        mythology?.name || '',
        godId,
        god?.name || ''
      )
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Wybór mitologii */}
      <div className="relative">
        <select
          value={selectedMythology}
          onChange={(e) => handleMythologyChange(e.target.value)}
          className="appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 pr-10 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {mythologies.map((mythology) => (
            <option key={mythology.id} value={mythology.id}>
              {mythology.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
      </div>

      {/* Wybór boga */}
      {gods.length > 0 && (
        <div className="relative">
          <select
            value={selectedGod || 'mythology'}
            onChange={(e) => handleGodChange(e.target.value)}
            className="appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 pr-10 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="mythology">Mitologia (ogólnie)</option>
            {gods.map((god) => (
              <option key={god.id} value={god.id}>
                {god.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        </div>
      )}
    </div>
  )
}
