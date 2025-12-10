// Rate limiting dla czatu

const RATE_LIMIT_KEY = 'mythchat_rate_limit'

type RateLimitData = {
  lastRequest: number
  count: number
}

// Sprawdź czy user może wysłać wiadomość
export function checkRateLimit(isLoggedIn: boolean): boolean {
  if (typeof window === 'undefined') return false

  const limit = isLoggedIn ? 2 : 1 // Zalogowani: 2/min, Goście: 1/min
  const windowMs = 60 * 1000 // 1 minuta

  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY)
    const now = Date.now()

    if (!data) {
      // Pierwsze wywołanie
      const newData: RateLimitData = { lastRequest: now, count: 1 }
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData))
      return true
    }

    const rateLimitData: RateLimitData = JSON.parse(data)
    const timeSinceLastRequest = now - rateLimitData.lastRequest

    if (timeSinceLastRequest > windowMs) {
      // Reset po upływie okna czasowego
      const newData: RateLimitData = { lastRequest: now, count: 1 }
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData))
      return true
    }

    if (rateLimitData.count < limit) {
      // Wciąż w limicie
      const newData: RateLimitData = {
        lastRequest: rateLimitData.lastRequest,
        count: rateLimitData.count + 1,
      }
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData))
      return true
    }

    // Przekroczono limit
    return false
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return false
  }
}

// Reset rate limit (np. po zalogowaniu)
export function resetRateLimit(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(RATE_LIMIT_KEY)
  } catch (error) {
    console.error('Error resetting rate limit:', error)
  }
}
