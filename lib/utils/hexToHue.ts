/**
 * Konwertuje kolor HEX na wartość HUE w stopniach (0-360)
 * @param hex np. '#FF5733'
 * @returns hue (0-360)
 */
export function hexToHue(hex: string): number {
  // Usuń # jeśli istnieje
  const hexClean = hex.replace('#', '')

  // Parsuj RGB
  const r = parseInt(hexClean.substring(0, 2), 16) / 255
  const g = parseInt(hexClean.substring(2, 4), 16) / 255
  const b = parseInt(hexClean.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let hue = 0

  if (delta === 0) {
    hue = 0
  } else if (max === r) {
    hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6
  } else if (max === g) {
    hue = ((b - r) / delta + 2) / 6
  } else {
    hue = ((r - g) / delta + 4) / 6
  }

  return Math.round(hue * 360)
}
