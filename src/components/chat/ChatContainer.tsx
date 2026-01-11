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
import MythologySelector from './MythologySelector'
import ThemedSVG from '../ThemedSVG'

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
  initialQuery?: string
  mythologyId?: string
  godId?: string
}

export default function ChatContainer({
  sessionId,
  initialQuery,
  mythologyId,
  godId,
}: ChatContainerProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { setAccent } = useTheme()
  const [session, setSession] = useState<ChatSession | null>(null)
  const [mythology, setMythology] = useState<any>(null)
  const [god, setGod] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialQuerySent = useRef(false)

  useEffect(() => {
    async function loadSession() {
      try {
        let mythologyIdToUse = mythologyId
        let godIdToUse = godId === 'mythology' ? null : godId

        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            sessionId
          )

        if (isUUID && user) {
          const dbSessions = await getUserSessions(user.id)
          const found = dbSessions.find((s) => s.id === sessionId)

          if (found) {
            const mythologyData = await getMythologyById(found.mythology_id)
            setMythology(mythologyData)

            const godData = found.god_id ? await getGodById(found.god_id) : null
            setGod(godData)

            const loadedSession: ChatSession = {
              id: found.id,
              mythologyId: found.mythology_id,
              mythologyName: mythologyData?.name || 'Mitologia',
              godId: found.god_id,
              godName: godData?.name || null,
              messages: found.messages || [],
              createdAt: found.created_at,
            }

            setSession(loadedSession)
            await setAccent(loadedSession.mythologyId, loadedSession.godId)
            return
          }
        }

        if (sessionId.startsWith('mythology_')) {
          mythologyIdToUse = sessionId.replace('mythology_', '')
          godIdToUse = null
        }

        if (!mythologyIdToUse && mythologyId) {
          mythologyIdToUse = mythologyId
        }
        if (!godIdToUse && godId && godId !== 'mythology') {
          godIdToUse = godId
        }

        if (!mythologyIdToUse) {
          setError('Nie udało się załadować sesji.')
          return
        }

        if (!user) {
          const localSession = getSession(sessionId)
          if (localSession) {
            // ✅ FIX: Załaduj mythology i god dla localStorage
            const mythologyData = await getMythologyById(
              localSession.mythologyId
            )
            const godData = localSession.godId
              ? await getGodById(localSession.godId)
              : null

            setMythology(mythologyData)
            setGod(godData)
            setSession(localSession)
            await setAccent(localSession.mythologyId, localSession.godId)
            return
          }
        }

        const mythologyData = await getMythologyById(mythologyIdToUse)
        const godData = godIdToUse ? await getGodById(godIdToUse) : null

        setMythology(mythologyData)
        setGod(godData)

        const newSession: ChatSession = {
          id: sessionId,
          mythologyId: mythologyIdToUse,
          mythologyName: mythologyData?.name || 'Mitologia',
          godId: godIdToUse || null,
          godName: godData?.name || null,
          messages: [],
          createdAt: new Date().toISOString(),
        }

        setSession(newSession)
        await setAccent(newSession.mythologyId, newSession.godId)
      } catch (error) {
        console.error('Error loading session:', error)
        setError('Błąd ładowania sesji')
      }
    }

    loadSession()
  }, [sessionId, mythologyId, godId, user, setAccent])

  useEffect(() => {
    if (initialQuery && session && !initialQuerySent.current) {
      initialQuerySent.current = true

      const url = new URL(window.location.href)
      url.searchParams.delete('q')
      router.replace(url.pathname + url.search, { scroll: false })

      sendMessage(initialQuery)
    }
  }, [initialQuery, session])

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || isLoading) return

    const canSend = checkRateLimit(!!user)
    if (!canSend) {
      setError(`Limit (${user ? '3' : '2'}/min). Poczekaj.`)
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
        if (session.messages.length === 0) {
          const sessionName = `${
            session.godName || session.mythologyName
          } - ${new Date().toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}`

          const dbSession = await createSession(
            user.id,
            session.mythologyId,
            session.godId,
            sessionName,
            finalMessages
          )

          const redirectUrl = `/chat/${dbSession.id}?mythology=${
            session.mythologyId
          }${session.godId ? `&god=${session.godId}` : ''}`

          finalSession.id = dbSession.id
          setSession(finalSession)

          router.replace(redirectUrl, { scroll: false })
        } else {
          await updateSession(session.id, finalMessages)
        }
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
    await setAccent(mythologyId, godId)

    const newSessionId = godId ? godId : `mythology_${mythologyId}`
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

  // ✅ URL avatara (priorytet: avatar_url → icon_url → mythology fallback)
  const avatarUrl =
    god?.avatar_url || god?.icon_url || mythology?.image_url || ''

  return (
    <div className="relative flex h-screen w-full flex-col pt-20 overflow-hidden">
      {/* ✅ LEFT AVATAR - absolute position, 70% wysokości, za tekstem */}
      {session.godId && avatarUrl && (
        <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 z-0 pointer-events-none">
          <ThemedSVG
            src={avatarUrl}
            alt={session.godName || ''}
            size="xlarge"
            className="opacity-20 hover:opacity-30 transition-opacity duration-500"
          />
        </div>
      )}

      {/* ✅ MAIN CONTENT - z-index wyższy niż avatar */}
      <div className="relative z-10 flex flex-1 gap-4 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-end px-4">
            <MessagesArea
              messages={session.messages}
              isLoading={isLoading}
              godName={session.godName}
            />
          </div>
        </div>

        {/* Mythology Selector - tylko desktop, sticky at top right */}
        <div className="hidden sm:flex flex-col w-1/6 gap-4 p-4">
          <div className="sticky top-0">
            <MythologySelector
              currentMythologyId={session.mythologyId}
              currentGodId={session.godId}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </div>
      </div>

      {/* Chat input - full width, z-index najwyższy */}
      <div className="relative z-20 w-full">
        <ChatInput
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
