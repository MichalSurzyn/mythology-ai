// Zarządzanie sesjami czatu w localStorage

const STORAGE_KEY = 'mythchat_sessions'
const EXPIRY_DAYS = 7

type ChatSession = {
  id: string
  mythologyId: string
  mythologyName: string
  godId: string | null
  godName: string | null
  messages: any[]
  createdAt: string
}

// Zapisz sesję
export function saveSession(session: ChatSession): void {
  if (typeof window === 'undefined') return

  try {
    const sessions = getAllSessions()
    const index = sessions.findIndex((s) => s.id === session.id)

    if (index !== -1) {
      sessions[index] = session
    } else {
      sessions.push(session)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving session:', error)
  }
}

// Pobierz sesję po ID
export function getSession(sessionId: string): ChatSession | null {
  if (typeof window === 'undefined') return null

  try {
    const sessions = getAllSessions()
    return sessions.find((s) => s.id === sessionId) || null
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Pobierz wszystkie sesje
export function getAllSessions(): ChatSession[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const sessions: ChatSession[] = JSON.parse(data)

    // Usuń wygasłe sesje (starsze niż 7 dni)
    const now = new Date().getTime()
    const validSessions = sessions.filter((session) => {
      const createdAt = new Date(session.createdAt).getTime()
      const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24)
      return daysDiff < EXPIRY_DAYS
    })

    // Zaktualizuj localStorage jeśli usunięto jakieś sesje
    if (validSessions.length !== sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions))
    }

    return validSessions
  } catch (error) {
    console.error('Error getting all sessions:', error)
    return []
  }
}

// Usuń sesję
export function deleteSession(sessionId: string): void {
  if (typeof window === 'undefined') return

  try {
    const sessions = getAllSessions()
    const filtered = sessions.filter((s) => s.id !== sessionId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting session:', error)
  }
}

// Wyczyść wszystkie sesje
export function clearAllSessions(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing sessions:', error)
  }
}
