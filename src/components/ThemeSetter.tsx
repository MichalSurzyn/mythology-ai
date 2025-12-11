// src/components/ThemeSetter.tsx
'use client'

import { useEffect } from 'react'
import { useTheme } from '@lib/contexts/ThemeContext'

interface ThemeSetterProps {
  mythologyId: string
  godId?: string | null
}

/**
 * Komponent który ustawia theme color na podstawie mythology/god
 * Używany na stronach SSR (mythology/god pages)
 */
export default function ThemeSetter({ mythologyId, godId }: ThemeSetterProps) {
  const { setAccent } = useTheme()

  useEffect(() => {
    setAccent(mythologyId, godId)
  }, [mythologyId, godId, setAccent])

  return null // Nie renderuje nic - tylko efekt uboczny
}
