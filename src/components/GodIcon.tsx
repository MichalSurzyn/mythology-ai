// src/components/GodIcon.tsx
'use client'

import { useEffect, useState } from 'react'

interface GodIconProps {
  iconUrl: string | null
  godName: string
  accentColor?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const sizeMap = {
  small: 24,
  medium: 48,
  large: 96,
}

/**
 * Komponent do wyświetlania ikon bogów (SVG)
 * - Automatycznie koloruje SVG na accent_color boga
 * - Centruje i skaluje SVG do dostępnej przestrzeni
 * - Obsługuje fallback do placeholdera
 */
export default function GodIcon({
  iconUrl,
  godName,
  accentColor = '#ffffff',
  size = 'medium',
  className = '',
}: GodIconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!iconUrl) {
      console.log(`❌ No iconUrl for ${godName}`)
      setError(true)
      return
    }

    console.log(`🎨 Loading icon for ${godName}:`, iconUrl)

    // Fetch SVG
    fetch(iconUrl)
      .then((res) => {
        if (!res.ok) {
          console.error(`❌ Failed to fetch SVG for ${godName}:`, res.status)
          throw new Error('Failed to load SVG')
        }
        return res.text()
      })
      .then((svg) => {
        console.log(`✅ SVG loaded for ${godName}`)

        // Parse SVG
        const parser = new DOMParser()
        const doc = parser.parseFromString(svg, 'image/svg+xml')
        const svgElement = doc.querySelector('svg')

        if (!svgElement) {
          console.error(`❌ Invalid SVG for ${godName}`)
          throw new Error('Invalid SVG')
        }

        // ========================================
        // CZYSZCZENIE STYLÓW CSS W SVG
        // ========================================
        // Usuń wszystkie <style> tagi (mogą nadpisywać fill)
        const styleTags = svgElement.querySelectorAll('style')
        styleTags.forEach((style) => style.remove())

        // Usuń inline style="" attributes
        const elementsWithStyle = svgElement.querySelectorAll('[style]')
        elementsWithStyle.forEach((el) => {
          el.removeAttribute('style')
        })

        // ========================================
        // KOLOROWANIE SVG - AGRESYWNE
        // ========================================
        // Wszystkie elementy graficzne
        const graphicElements = svgElement.querySelectorAll(
          'path, rect, circle, ellipse, polygon, polyline, line'
        )

        graphicElements.forEach((el) => {
          // Usuń wszystkie atrybuty kolorów
          el.removeAttribute('fill')
          el.removeAttribute('stroke')

          // Ustaw nowy kolor
          el.setAttribute('fill', accentColor)

          // Jeśli element miał stroke, zachowaj go
          const currentStroke = el.getAttribute('stroke')
          if (currentStroke && currentStroke !== 'none') {
            el.setAttribute('stroke', accentColor)
          }
        })

        // Usuń fill/stroke z <g> grup
        const groups = svgElement.querySelectorAll('g')
        groups.forEach((g) => {
          g.removeAttribute('fill')
          g.removeAttribute('stroke')
        })

        // Ustaw domyślny fill na <svg> jako fallback
        svgElement.setAttribute('fill', accentColor)

        // ========================================
        // CENTROWANIE I SKALOWANIE
        // ========================================
        svgElement.removeAttribute('width')
        svgElement.removeAttribute('height')

        // Zachowaj viewBox lub stwórz domyślny
        if (!svgElement.hasAttribute('viewBox')) {
          const bbox = svgElement.getBBox?.() || {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          }
          svgElement.setAttribute(
            'viewBox',
            `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
          )
        }

        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')

        console.log(`🎨 SVG colored with ${accentColor} for ${godName}`)
        setSvgContent(svgElement.outerHTML)
        setError(false)
      })
      .catch((err) => {
        console.error(`❌ Error loading SVG for ${godName}:`, err)
        setError(true)
      })
  }, [iconUrl, accentColor, godName])

  const pixelSize = sizeMap[size]

  // Fallback - placeholder gdy brak ikony
  if (error || !iconUrl) {
    console.log(`🔤 Showing placeholder for ${godName}`)
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-zinc-800 ${className}`}
        style={{
          width: pixelSize,
          height: pixelSize,
          minWidth: pixelSize,
          minHeight: pixelSize,
        }}
      >
        <span
          className="font-bold text-zinc-400"
          style={{ fontSize: pixelSize * 0.4 }}
        >
          {godName[0]?.toUpperCase() || '?'}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        minWidth: pixelSize,
        minHeight: pixelSize,
      }}
      dangerouslySetInnerHTML={svgContent ? { __html: svgContent } : undefined}
    />
  )
}
