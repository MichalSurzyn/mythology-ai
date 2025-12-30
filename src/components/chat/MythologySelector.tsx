'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '@lib/contexts/ThemeContext'
import { Listbox } from '@headlessui/react'
import React from 'react'

interface MythologySelectorProps {
  currentMythologyId: string
  currentGodId: string | null
  onSelectionChange: (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => void
  /** * Jeśli true, lista rozwijana otworzy się nad przyciskiem.
   * Przydatne, gdy komponent jest na dole strony.
   */
  openUpwards?: boolean
}

export default function MythologySelector({
  currentMythologyId,
  currentGodId,
  onSelectionChange,
  openUpwards = false, // Domyślnie false (otwiera się w dół)
}: MythologySelectorProps) {
  const { mythologies } = useTheme()
  const [selectedMythology, setSelectedMythology] = useState(currentMythologyId)
  const [selectedGod, setSelectedGod] = useState<string | null>(currentGodId)

  useEffect(() => {
    if (currentMythologyId && currentMythologyId !== selectedMythology) {
      setSelectedMythology(currentMythologyId)
      setSelectedGod(null)
    }
  }, [currentMythologyId, selectedMythology])

  const currentMythology = mythologies.find((m) => m.id === selectedMythology)
  const gods = currentMythology?.gods || []

  const handleMythologyChange = (mythologyId: string) => {
    setSelectedMythology(mythologyId)
    setSelectedGod(null)
    const mythology = mythologies.find((m) => m.id === mythologyId)
    onSelectionChange(mythologyId, mythology?.name || '', null, null)
  }

  const handleGodChange = (godId: string | null) => {
    if (godId === null) {
      setSelectedGod(null)
      const mythology = mythologies.find((m) => m.id === selectedMythology)
      onSelectionChange(selectedMythology, mythology?.name || '', null, null)
    } else {
      const god = gods.find((g) => g.id === godId)
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

  // Logika ustalająca klasy CSS w zależności od kierunku otwierania
  const dropdownPositionClasses = openUpwards ? 'bottom-full mb-2' : 'mt-2'

  // Opcjonalnie: obróć strzałkę, jeśli menu otwiera się do góry
  const chevronRotation = openUpwards ? 'rotate-180' : ''

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Mythology Listbox */}
      <Listbox value={selectedMythology} onChange={handleMythologyChange}>
        <div className="relative w-fit">
          <Listbox.Button className="appearance-none rounded-lg border border-transparent bg-black px-4 py-2 pr-10 text-sm text-white hover:border-accent transition-colors duration-500 flex items-center gap-2">
            {mythologies.find((m) => m.id === selectedMythology)?.name}
            <ChevronDown
              size={12}
              className={`text-zinc-400 transition-transform ${chevronRotation}`}
            />
          </Listbox.Button>

          <Listbox.Options
            className={`absolute z-10 w-48 rounded-lg bg-black shadow-lg ${dropdownPositionClasses}`}
          >
            {mythologies.map((mythology) => (
              <Listbox.Option
                key={mythology.id}
                value={mythology.id}
                className="px-4 py-2 text-sm text-white hover:text-accent cursor-pointer transition-colors duration-200"
              >
                {mythology.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* God Listbox */}
      {gods.length > 0 && (
        <Listbox value={selectedGod} onChange={handleGodChange}>
          <div className="relative w-fit">
            <Listbox.Button className="appearance-none rounded-lg border border-transparent bg-black px-4 py-2 pr-10 text-sm text-white hover:border-accent focus:outline-none transition-colors duration-500 flex items-center gap-2">
              {selectedGod
                ? gods.find((g) => g.id === selectedGod)?.name
                : 'Mitologia (ogólnie)'}
              <ChevronDown
                size={12}
                className={`text-zinc-400 transition-transform ${chevronRotation}`}
              />
            </Listbox.Button>

            <Listbox.Options
              className={`absolute z-10 w-48 rounded-lg bg-black shadow-lg ${dropdownPositionClasses}`}
            >
              <Listbox.Option
                value={null}
                className="px-4 py-2 text-sm text-white hover:text-accent cursor-pointer transition-colors duration-200"
              >
                Mitologia (ogólnie)
              </Listbox.Option>
              {gods.map((god) => (
                <Listbox.Option
                  key={god.id}
                  value={god.id}
                  className="px-4 py-2 text-sm text-white hover:text-accent cursor-pointer transition-colors duration-200"
                >
                  {god.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      )}
    </div>
  )
}
