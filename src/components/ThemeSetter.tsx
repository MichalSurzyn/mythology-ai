// src/components/ThemeSetter.tsx
'use client'

import { useEffect } from 'react'
import { useTheme } from '@lib/contexts/ThemeContext'
import { hexToHue } from '@lib/utils/hexToHue'

interface ThemeSetterProps {
  mythologyId: string
  godId?: string | null
}

/**
 * Komponent który ustawia theme color na podstawie mythology/god
 * Używany na stronach SSR (mythology/god pages)
 */
export default function ThemeSetter({ mythologyId, godId }: ThemeSetterProps) {
  const { setAccent, accentColor } = useTheme()

  useEffect(() => {
    setAccent(mythologyId, godId)
  }, [mythologyId, godId, setAccent])

  return null // Nie renderuje nic - tylko efekt uboczny
}

/**
 * Hook do pobierania HUE (0-360) z aktualnego accent color
 * Używa ThemeContext - musi być w ThemeProvider
 */
export function useGalaxyHue(): number {
  const { accentColor } = useTheme()
  return hexToHue(accentColor)
}
