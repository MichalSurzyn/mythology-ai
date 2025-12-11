// lib/contexts/ThemeContext.tsx
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { getGodById } from '@lib/supabase/queries/gods'

type ColorMap = Record<string, string>

type God = {
  id: string
  name: string
  title?: string | null
  accent_color: string | null
}

type Mythology = {
  id: string
  name: string
  theme_color: string
  gods: God[]
}

type ThemeContextType = {
  accentColor: string
  setAccent: (mythId: string, godId?: string | null) => Promise<void>
  colorMap: ColorMap
  mythologies: Mythology[]
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({
  children,
  colorMap,
  mythologies,
}: {
  children: ReactNode
  colorMap: ColorMap
  mythologies: Mythology[]
}) {
  const [accentColor, setAccentColor] = useState('#ffffff') // default biały
  const [godColors, setGodColors] = useState<ColorMap>({})
  const [isLoading, setIsLoading] = useState(false)

  const setAccent = async (mythId: string, godId?: string | null) => {
    setIsLoading(true)

    try {
      if (godId) {
        // Sprawdź cache bogów
        if (godColors[godId]) {
          setAccentColor(godColors[godId])
          return
        }

        // Sprawdź w danych z Context (uniknij DB query!)
        const myth = mythologies.find((m) => m.id === mythId)
        const god = myth?.gods.find((g) => g.id === godId)

        if (god?.accent_color) {
          setGodColors((prev) => ({ ...prev, [godId]: god.accent_color! }))
          setAccentColor(god.accent_color)
          return
        }

        // Fallback: fetch z DB (tylko jeśli nie ma w Context)
        const godFromDb = await getGodById(godId)
        if (godFromDb?.accent_color) {
          setGodColors((prev) => ({
            ...prev,
            [godId]: godFromDb.accent_color!,
          }))
          setAccentColor(godFromDb.accent_color)
          return
        }
      }

      // Fallback do koloru mitologii
      setAccentColor(colorMap[mythId] || '#ffffff')
    } catch (error) {
      console.error('Error setting accent color:', error)
      setAccentColor(colorMap[mythId] || '#ffffff')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Ustaw CSS variables dla całej strony
    document.documentElement.style.setProperty('--accent-color', accentColor)

    // RGB version dla opacity (np. bg-[rgba(var(--accent-rgb),0.1)])
    const rgb = hexToRgb(accentColor)
    document.documentElement.style.setProperty('--accent-rgb', rgb)
  }, [accentColor])

  return (
    <ThemeContext.Provider
      value={{ accentColor, setAccent, colorMap, mythologies, isLoading }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Helper: hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255, 255, 255'

  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
    result[3],
    16
  )}`
}
