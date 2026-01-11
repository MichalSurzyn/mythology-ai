'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@lib/contexts/ThemeContext'

interface ThemedSVGProps {
  src: string
  alt?: string
  className?: string
  size?: 'small' | 'medium' | 'large' | 'xlarge' // ✅ Dodano xlarge
  flip?: boolean
}

export default function ThemedSVG({
  src,
  alt = 'SVG Icon',
  className = '',
  size = 'medium',
  flip = false,
}: ThemedSVGProps) {
  const { accentColor } = useTheme()
  const [svgContent, setSvgContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!src) {
      setIsLoading(false)
      return
    }

    fetch(src)
      .then((res) => res.text())
      .then((svgText) => {
        let cleanedSvg = svgText

        // 1. Usuń XML declaration
        cleanedSvg = cleanedSvg.replace(/<\?xml[^>]*\?>/g, '')

        // 2. Usuń komentarze
        cleanedSvg = cleanedSvg.replace(/<!--[\s\S]*?-->/g, '')

        // 3. Usuń białe/czarne prostokąty (tła)
        cleanedSvg = cleanedSvg.replace(
          /<rect[^>]*fill="(?:#ffffff|#000000|white|black)"[^>]*\/>/gi,
          ''
        )

        // 4. Usuń style fill
        cleanedSvg = cleanedSvg.replace(/style="[^"]*fill:[^;"]*;?[^"]*"/gi, '')

        // 5. Usuń atrybuty fill/stroke
        cleanedSvg = cleanedSvg.replace(/fill="[^"]*"/gi, '')
        cleanedSvg = cleanedSvg.replace(/fill='[^']*'/gi, '')
        cleanedSvg = cleanedSvg.replace(/stroke="[^"]*"/gi, '')
        cleanedSvg = cleanedSvg.replace(/stroke='[^']*'/gi, '')
        cleanedSvg = cleanedSvg.replace(/fill-opacity="[^"]*"/gi, '')
        cleanedSvg = cleanedSvg.replace(/stroke-opacity="[^"]*"/gi, '')

        // ========================================
        // ✅ KLUCZ: Usuń width/height, zostaw tylko viewBox
        // ========================================

        // Wyciągnij viewBox (jeśli istnieje)
        const viewBoxMatch = cleanedSvg.match(/viewBox="([^"]*)"/i)
        let viewBox = viewBoxMatch ? viewBoxMatch[1] : null

        // Jeśli nie ma viewBox, stwórz z width/height
        if (!viewBox) {
          const widthMatch = cleanedSvg.match(/width="([^"]*)"/i)
          const heightMatch = cleanedSvg.match(/height="([^"]*)"/i)

          if (widthMatch && heightMatch) {
            const w = widthMatch[1].replace(/[^0-9.]/g, '')
            const h = heightMatch[1].replace(/[^0-9.]/g, '')
            viewBox = `0 0 ${w} ${h}`
          } else {
            viewBox = '0 0 100 100' // Fallback
          }
        }

        // Usuń stare width/height z <svg>
        cleanedSvg = cleanedSvg.replace(/width="[^"]*"/gi, '')
        cleanedSvg = cleanedSvg.replace(/height="[^"]*"/gi, '')

        // Dodaj viewBox i responsive attributes
        cleanedSvg = cleanedSvg.replace(
          /<svg([^>]*)>/i,
          `<svg$1 viewBox="${viewBox}" width="100%" height="100%" fill="currentColor" preserveAspectRatio="xMidYMid meet">`
        )

        setSvgContent(cleanedSvg)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error loading SVG:', error)
        setIsLoading(false)
      })
  }, [src])

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-zinc-800 rounded ${getSizeClass(
          size
        )} ${className}`}
      />
    )
  }

  if (!svgContent) {
    return null
  }

  return (
    <div
      className={`${getSizeClass(size)} ${
        flip ? 'scale-x-[-1]' : ''
      } ${className} flex items-center justify-center`}
      style={{ color: accentColor }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      aria-label={alt}
    />
  )
}

// ✅ Responsywne rozmiary z max-width dla bezpieczeństwa
function getSizeClass(size: 'small' | 'medium' | 'large' | 'xlarge'): string {
  switch (size) {
    case 'small':
      return 'w-6 h-6 sm:w-8 sm:h-8 max-w-[2rem] max-h-[2rem]' // Sidebar: Max 32px
    case 'medium':
      return 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 max-w-[12rem] max-h-[12rem]' // Chat mobile: Max 192px
    case 'large':
      return 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 max-w-[16rem] max-h-[16rem]' // God page mobile: Max 256px
    case 'xlarge':
      return 'w-[50vh] h-[70vh] max-h-[80vh]' // ✅ Chat/God page desktop: 70% wysokości ekranu
    default:
      return 'w-32 h-32 max-w-[8rem] max-h-[8rem]'
  }
}
