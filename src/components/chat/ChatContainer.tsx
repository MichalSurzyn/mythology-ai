'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatHeader from './ChatHeader'
import MessagesArea from './MessagesArea'
import ChatInput from './ChatInput'
import { useAuth } from '@lib/hooks/useAuth'
import {
  getSession,
  saveSession,
  getAllSessions,
} from '@lib/utils/localStorage'
import {
  getUserSessions,
  createSession,
  updateSession,
  migrateSessions,
} from '@lib/supabase/queries/chat'
import { getMythologyById } from '@lib/supabase/queries/mythologies'
import { getGodById } from '@lib/supabase/queries/gods'
import { checkRateLimit } from '@lib/utils/rateLimit'
import React from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

type ChatSession = {
  id: string
  mythologyId: string
  mythologyName: string
  godId: string | null
  godName: string | null
  messages: Message[]
  createdAt: string
}

interface ChatContainerProps {
  sessionId: string
  mythologies: any[]
  initialQuery?: string
  mythologyId?: string
  godId?: string
}

export default function ChatContainer({
  sessionId,
  mythologies,
  initialQuery,
  mythologyId,
  godId,
}: ChatContainerProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [session, setSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMigrated, setHasMigrated] = useState(false)
  const initialQuerySent = useRef(false)

  // Migracja sesji po zalogowaniu
  useEffect(() => {
    async function migrate() {
      if (user && !hasMigrated) {
        try {
          const localSessions = getAllSessions()
          if (localSessions.length > 0) {
            await migrateSessions(user.id, localSessions)
            localStorage.removeItem('mythchat_sessions')
            setHasMigrated(true)
          }
        } catch (error) {
          console.error('Migration error:', error)
        }
      }
    }
    migrate()
  }, [user, hasMigrated])

  // Załaduj lub stwórz sesję
  useEffect(() => {
    async function loadSession() {
      if (!mythologyId) return

      try {
        // Sprawdź czy sesja istnieje
        let existingSession: ChatSession | null = null

        if (user) {
          const dbSessions = await getUserSessions(user.id)
          const found = dbSessions.find((s) => s.id === sessionId)
          if (found) {
            const mythology = await getMythologyById(found.mythology_id)
            const god = found.god_id ? await getGodById(found.god_id) : null

            existingSession = {
              id: found.id,
              mythologyId: found.mythology_id,
              mythologyName: mythology?.name || 'Mitologia',
              godId: found.god_id,
              godName: god?.name || null,
              messages: found.messages || [],
              createdAt: found.created_at,
            }
          }
        } else {
          const localSession = getSession(sessionId)
          if (localSession) {
            existingSession = localSession
          }
        }

        // Jeśli sesja istnieje, załaduj ją
        if (existingSession) {
          setSession(existingSession)
          return
        }

        // Nowa sesja
        const mythology = await getMythologyById(mythologyId)
        const god = godId ? await getGodById(godId) : null

        const newSession: ChatSession = {
          id: sessionId,
          mythologyId: mythologyId,
          mythologyName: mythology?.name || 'Mitologia',
          godId: godId || null,
          godName: god?.name || null,
          messages: [],
          createdAt: new Date().toISOString(),
        }

        setSession(newSession)

        // Zapisz tylko dla gości (zalogowani przy pierwszej wiadomości)
        if (!user) {
          saveSession(newSession)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }

    loadSession()
  }, [sessionId, mythologyId, godId, user])

  // Wyślij inicjalne zapytanie
  useEffect(() => {
    if (initialQuery && session && !initialQuerySent.current) {
      initialQuerySent.current = true
      sendMessage(initialQuery)
    }
  }, [initialQuery, session])

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || isLoading) return

    // Rate limit
    const canSend = checkRateLimit(!!user)
    if (!canSend) {
      setError(`Limit (${user ? '2' : '1'}/min). Poczekaj.`)
      setTimeout(() => setError(null), 5000)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...session.messages, userMessage]
    const updatedSession = { ...session, messages: updatedMessages }
    setSession(updatedSession)
    setIsLoading(true)
    setError(null)

    try {
      // Stwórz sesję w bazie przy pierwszej wiadomości
      if (user && session.messages.length === 0) {
        const dbSession = await createSession(
          user.id,
          session.mythologyId,
          session.godId,
          session.godName || session.mythologyName,
          updatedMessages
        )
        updatedSession.id = dbSession.id
      } else if (user) {
        await updateSession(session.id, updatedMessages)
      } else {
        saveSession(updatedSession)
      }

      // API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mythologyId: session.mythologyId,
          mythologyName: session.mythologyName,
          godId: session.godId,
          godName: session.godName,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error('API error')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      const finalSession = { ...updatedSession, messages: finalMessages }
      setSession(finalSession)

      // Zapisz
      if (user) {
        await updateSession(finalSession.id, finalMessages)
      } else {
        saveSession(finalSession)
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError('Błąd odpowiedzi. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectionChange = (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => {
    // Przekieruj do nowej sesji
    const newSessionId = `${mythologyId}_${godId || 'mythology'}`
    router.push(
      `/chat/${newSessionId}?mythology=${mythologyId}${
        godId ? `&god=${godId}` : ''
      }`
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  const greetingMessage = session.godName
    ? `Witaj, śmiertelniku. Jestem ${session.godName}. Czego pragniesz ode mnie?`
    : `Witaj w świecie ${session.mythologyName}. O czym chcesz się dowiedzieć?`

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Sticky Header */}
      <ChatHeader title={session.godName || session.mythologyName} />

      {/* Messages Area - zajmuje całą dostępną przestrzeń */}
      <MessagesArea
        messages={session.messages}
        greetingMessage={greetingMessage}
        isLoading={isLoading}
      />

      {/* Input Area - na dole */}
      <ChatInput
        mythologies={mythologies}
        currentMythologyId={session.mythologyId}
        currentGodId={session.godId}
        onSend={sendMessage}
        onSelectionChange={handleSelectionChange}
        isLoading={isLoading}
        error={error}
        isLoggedIn={!!user}
      />
    </div>
  )
}
