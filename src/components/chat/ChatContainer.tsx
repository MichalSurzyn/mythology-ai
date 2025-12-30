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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialQuerySent = useRef(false)

  // ========================================
  // ZAŁADUJ LUB STWÓRZ SESJĘ
  // ========================================
  useEffect(() => {
    async function loadSession() {
      console.log('🚀 loadSession START')
      console.log('📦 sessionId:', sessionId)
      console.log('📦 mythologyId param:', mythologyId)
      console.log('📦 godId param:', godId)
      console.log('👤 user:', user?.id)

      try {
        let mythologyIdToUse = mythologyId
        let godIdToUse = godId === 'mythology' ? null : godId

        // ========================================
        // KROK 1: Sprawdź format sessionId
        // ========================================
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            sessionId
          )
        console.log('🔍 isUUID:', isUUID)

        if (isUUID && user) {
          console.log('✅ UUID detected + user logged in - searching in DB')
          // ========================================
          // ZALOGOWANY - ładuj z DB po UUID
          // ========================================
          const dbSessions = await getUserSessions(user.id)
          console.log('📚 DB sessions count:', dbSessions.length)

          const found = dbSessions.find((s) => s.id === sessionId)
          console.log('🔎 Found session:', found ? 'YES' : 'NO')

          if (found) {
            console.log('✅ Loading session from DB:', found.id)
            const mythology = await getMythologyById(found.mythology_id)

            // ✅ FIX: Nie fetch god jeśli god_id jest NULL
            const god = found.god_id ? await getGodById(found.god_id) : null

            const loadedSession: ChatSession = {
              id: found.id,
              mythologyId: found.mythology_id,
              mythologyName: mythology?.name || 'Mitologia',
              godId: found.god_id,
              godName: god?.name || null,
              messages: found.messages || [],
              createdAt: found.created_at,
            }

            setSession(loadedSession)
            await setAccent(loadedSession.mythologyId, loadedSession.godId)
            console.log('✅ Session loaded successfully')
            return
          }

          console.log('⚠️ Session not found in DB, will create new')
        }

        // ========================================
        // KROK 2: Parsuj sessionId (dla niezalogowanych lub nowych sesji)
        // ========================================
        console.log('🔄 Parsing sessionId for mythology/god info')

        if (sessionId.startsWith('mythology_')) {
          // Format: "mythology_mythId"
          mythologyIdToUse = sessionId.replace('mythology_', '')
          godIdToUse = null
          console.log('📖 Mythology-only chat detected:', mythologyIdToUse)
        }
        // ✅ Usunięto check UUID bez parametrów - może przyjść z sidebara przed załadowaniem usera

        // Fallback do parametrów URL
        if (!mythologyIdToUse && mythologyId) {
          mythologyIdToUse = mythologyId
          console.log('📝 Using mythologyId from URL param:', mythologyIdToUse)
        }
        if (!godIdToUse && godId && godId !== 'mythology') {
          godIdToUse = godId
          console.log('📝 Using godId from URL param:', godIdToUse)
        }

        if (!mythologyIdToUse) {
          console.error('❌ No mythologyId found!')
          setError('Nie udało się załadować sesji.')
          return
        }

        console.log(
          '📋 Final IDs - mythology:',
          mythologyIdToUse,
          'god:',
          godIdToUse
        )

        // ========================================
        // KROK 3: Sprawdź localStorage (TYLKO dla niezalogowanych!)
        // ========================================
        if (!user) {
          console.log('👤 User not logged in, checking localStorage')
          const localSession = getSession(sessionId)
          if (localSession) {
            console.log('✅ Session found in localStorage')
            setSession(localSession)
            await setAccent(localSession.mythologyId, localSession.godId)
            return
          }
          console.log('⚠️ No session in localStorage, creating new')
        } else {
          // ✅ ZABEZPIECZENIE: Zalogowany user NIE powinien używać localStorage
          console.log(
            '🔒 User logged in - skipping localStorage check (DB priority)'
          )
        }

        // ========================================
        // KROK 4: Stwórz nową sesję
        // ========================================
        console.log('🆕 Creating new session')
        const mythology = await getMythologyById(mythologyIdToUse)
        const god = godIdToUse ? await getGodById(godIdToUse) : null

        console.log('✅ Mythology loaded:', mythology?.name)
        console.log('✅ God loaded:', god?.name || 'None (mythology chat)')

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
        await setAccent(newSession.mythologyId, newSession.godId)
        console.log('✅ New session created')

        // ✅ NIE ZAPISUJ TUTAJ - zapisze się po pierwszej wiadomości
        // Dla niezalogowanych: w sendMessage() → saveSession()
        // Dla zalogowanych: w sendMessage() → createSession() w DB
      } catch (error) {
        console.error('❌ Error loading session:', error)
        setError('Błąd ładowania sesji')
      }
    }

    loadSession()
  }, [sessionId, mythologyId, godId, user, setAccent])

  // ========================================
  // WYŚLIJ POCZĄTKOWE ZAPYTANIE (tylko raz!)
  // ========================================
  useEffect(() => {
    if (initialQuery && session && !initialQuerySent.current) {
      console.log('📤 Sending initial query:', initialQuery)
      initialQuerySent.current = true

      // Usuń ?q= z URL po wysłaniu
      const url = new URL(window.location.href)
      url.searchParams.delete('q')
      router.replace(url.pathname + url.search, { scroll: false })

      sendMessage(initialQuery)
    }
  }, [initialQuery, session])

  // ========================================
  // WYŚLIJ WIADOMOŚĆ
  // ========================================
  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || isLoading) return

    const canSend = checkRateLimit(!!user)
    if (!canSend) {
      setError(`Limit (${user ? '3' : '2'}/min). Poczekaj.`)
      setTimeout(() => setError(null), 5000)
      return
    }

    console.log('📤 Sending message:', content)

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
      // ========================================
      // Wywołaj API czatu
      // ========================================
      console.log('🌐 Calling chat API')
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

      if (!response.ok) {
        console.error('❌ API response not OK:', response.status)
        throw new Error('API error')
      }

      const data = await response.json()
      console.log('✅ AI response received')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      const finalSession = { ...updatedSession, messages: finalMessages }
      setSession(finalSession)

      // ========================================
      // ZAPIS DO BAZY / LOCALSTORAGE
      // ========================================
      if (user) {
        console.log('👤 User logged in - saving to DB')
        // Zalogowany - zapisz do DB
        if (session.messages.length === 0) {
          // Pierwsza wiadomość - stwórz sesję w DB
          console.log('🆕 Creating new DB session')
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

          console.log('✅ DB session created:', dbSession.id)

          // ✅ FIX: Zachowaj parametry przy przekierowaniu
          const redirectUrl = `/chat/${dbSession.id}?mythology=${
            session.mythologyId
          }${session.godId ? `&god=${session.godId}` : ''}`
          console.log('🔄 Redirecting to:', redirectUrl)

          // Zaktualizuj lokalny state PRZED przekierowaniem
          finalSession.id = dbSession.id
          setSession(finalSession)

          // Przekieruj z parametrami
          router.replace(redirectUrl, { scroll: false })
        } else {
          // Aktualizuj istniejącą sesję
          console.log('💾 Updating existing DB session:', session.id)
          await updateSession(session.id, finalMessages)
          console.log('✅ DB session updated')
        }
      } else {
        // Niezalogowany - zapisz do localStorage
        console.log('💾 Saving to localStorage')
        saveSession(finalSession)
      }
    } catch (err) {
      console.error('❌ Chat error:', err)
      setError('Błąd odpowiedzi. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  // ========================================
  // ZMIANA WYBORU (mitologia/bóg)
  // ========================================
  const handleSelectionChange = async (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => {
    console.log('🔄 Selection changed:', { mythologyId, godId })
    await setAccent(mythologyId, godId)

    // Nowy sessionId
    const newSessionId = godId ? godId : `mythology_${mythologyId}`
    console.log('🔄 Navigating to:', newSessionId)
    router.push(
      `/chat/${newSessionId}?mythology=${mythologyId}${
        godId ? `&god=${godId}` : ''
      }`
    )
  }

  // ========================================
  // LOADING STATE
  // ========================================
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="flex h-screen w-full flex-col pt-20">
      {/* Main content - flex row layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Messages area - 5/6 width */}
        <div className="w-5/6 overflow-y-auto no-scrollbar">
          <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-end">
            <MessagesArea
              messages={session.messages}
              isLoading={isLoading}
              godName={session.godName}
            />
          </div>
        </div>

        {/* Mythology selector - 1/6 width, sticky at top */}
        <div className="w-1/6  p-4 overflow-y-auto no-scrollbar">
          <div className="sticky top-0">
            <MythologySelector
              currentMythologyId={session.mythologyId}
              currentGodId={session.godId}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </div>
      </div>

      <div className="w-full z-10">
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
