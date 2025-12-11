'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MessagesArea from './MessagesArea'
import ChatInput from './ChatInput'
import { useAuth } from '@lib/hooks/useAuth'
import { useTheme } from '@lib/contexts/ThemeContext'
import { getSession, saveSession } from '@lib/utils/localStorage'
import {
  getUserSessions,
  createSession,
  updateSession,
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
  const { setAccent } = useTheme() // 👈 Nowy hook!
  const [session, setSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialQuerySent = useRef(false)

  // Załaduj lub stwórz sesję
  useEffect(() => {
    async function loadSession() {
      const [parsedMythId, parsedGodIdRaw] = sessionId.split('_')
      const parsedGodId =
        parsedGodIdRaw && parsedGodIdRaw !== 'mythology' ? parsedGodIdRaw : null

      let mythologyIdToUse = mythologyId ?? parsedMythId
      let godIdToUse = godId ?? parsedGodId

      try {
        let existingSession: ChatSession | null = null

        if (user) {
          const dbSessions = await getUserSessions(user.id)
          const found = dbSessions.find((s) => s.id === sessionId)
          if (found) {
            mythologyIdToUse = mythologyIdToUse ?? found.mythology_id
            godIdToUse = godIdToUse ?? found.god_id ?? null
            const mythology = mythologyIdToUse
              ? await getMythologyById(mythologyIdToUse)
              : null
            const god = found.god_id ? await getGodById(found.god_id) : null

            existingSession = {
              id: found.id,
              mythologyId: mythologyIdToUse || found.mythology_id,
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
            mythologyIdToUse = mythologyIdToUse ?? localSession.mythologyId
            godIdToUse = godIdToUse ?? localSession.godId ?? null
          }
        }

        if (existingSession) {
          setSession(existingSession)
          // Ustaw kolor akcentu
          await setAccent(existingSession.mythologyId, existingSession.godId)
          return
        }

        if (!mythologyIdToUse) {
          setError('Nie udało się odnaleźć sesji. Wróć do wyboru mitologii.')
          router.replace('/')
          return
        }

        const mythology = await getMythologyById(mythologyIdToUse)
        const god = godIdToUse ? await getGodById(godIdToUse) : null

        const newSession: ChatSession = {
          id: sessionId,
          mythologyId: mythologyIdToUse,
          mythologyName: mythology?.name || 'Mitologia',
          godId: godIdToUse || null,
          godName: god?.name || null,
          messages: [],
          createdAt: new Date().toISOString(),
        }

        setSession(newSession)

        // Ustaw kolor akcentu
        await setAccent(newSession.mythologyId, newSession.godId)

        if (!user) {
          saveSession(newSession)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }

    loadSession()
  }, [sessionId, mythologyId, godId, user, setAccent])

  // Wyślij inicjalne zapytanie
  useEffect(() => {
    if (initialQuery && session && !initialQuerySent.current) {
      initialQuerySent.current = true
      sendMessage(initialQuery)
    }
  }, [initialQuery, session])

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || isLoading) return

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

  const handleSelectionChange = async (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => {
    // Zmień kolor akcentu natychmiast
    await setAccent(mythologyId, godId)

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
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col pt-20">
      <div className="flex-1 w-full overflow-y-auto no-scrollbar">
        <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-end">
          <MessagesArea messages={session.messages} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full z-10">
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
    </div>
  )
}
