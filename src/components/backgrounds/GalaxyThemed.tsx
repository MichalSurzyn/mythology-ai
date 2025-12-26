'use client'

import Galaxy from './Galaxy'
import { GalaxyProps } from './Galaxy'
import { useGalaxyHue } from '@/components/ThemeSetter'

interface GalaxyThemedProps extends Omit<GalaxyProps, 'hueShift'> {
  hueShift?: number
}

/**
 * Wrapper Galaxy'ego który automatycznie pobiera hueShift z ThemeContext
 * Jeśli nie podasz hueShift, zostanie użyty kolor z bazy danych
 */
export default function GalaxyThemed({ hueShift, ...rest }: GalaxyThemedProps) {
  const themeHue = useGalaxyHue()
  const finalHue = hueShift !== undefined ? hueShift : themeHue

  return (
    <Galaxy hueShift={finalHue} monoColor={true} saturation={1} {...rest} />
  )
}
