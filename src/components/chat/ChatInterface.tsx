'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import MythologySelector from './MythologySelector'
import MessageBubble from './MessageBubble'
import {
  saveSession,
  getSession,
  getAllSessions,
} from '@lib/utils/localStorage'
import { checkRateLimit } from '@lib/utils/rateLimit'
import { useAuth } from '@lib/hooks/useAuth'
import {
  getUserSessions,
  createSession,
  updateSession,
  migrateSessions,
} from '@lib/supabase/queries/chat'
import React from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
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

interface ChatInterfaceProps {
  mythologies: any[]
}

export default function ChatInterface({ mythologies }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMigrated, setHasMigrated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Migracja sesji z localStorage po zalogowaniu
  useEffect(() => {
    async function migrateLocalSessions() {
      if (user && !hasMigrated) {
        try {
          const localSessions = getAllSessions()
          if (localSessions.length > 0) {
            await migrateSessions(user.id, localSessions)
            // Wyczyść localStorage po migracji
            if (typeof window !== 'undefined') {
              localStorage.removeItem('mythchat_sessions')
            }
            setHasMigrated(true)
          }
        } catch (error) {
          console.error('Migration error:', error)
        }
      }
    }

    migrateLocalSessions()
  }, [user, hasMigrated])

  // Wybór losowej mitologii na start (tylko jeśli brak currentSession)
  useEffect(() => {
    if (mythologies.length > 0 && !currentSession) {
      const randomMythology =
        mythologies[Math.floor(Math.random() * mythologies.length)]
      initializeSession(randomMythology.id, randomMythology.name, null, null)
    }
  }, [mythologies, currentSession])

  // Auto-scroll
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }, [currentSession?.messages])

  const initializeSession = async (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => {
    const sessionId = `${mythologyId}_${godId || 'mythology'}`

    // Sprawdź czy sesja już istnieje
    if (user) {
      // Zalogowany - sprawdź w bazie
      try {
        const dbSessions = await getUserSessions(user.id)
        const existing = dbSessions.find(
          (s) => s.mythology_id === mythologyId && s.god_id === godId
        )

        if (existing) {
          setCurrentSession({
            id: existing.id,
            mythologyId: existing.mythology_id,
            mythologyName,
            godId: existing.god_id,
            godName,
            messages: existing.messages || [],
            createdAt: existing.created_at,
          })
          return
        }
      } catch (error) {
        console.error('Error checking db sessions:', error)
      }
    } else {
      // Gość - sprawdź localStorage
      const existingSession = getSession(sessionId)
      if (existingSession) {
        setCurrentSession(existingSession)
        return
      }
    }

    // Nowa sesja (PUSTA - bez powitania w messages)
    const newSession: ChatSession = {
      id: sessionId,
      mythologyId,
      mythologyName,
      godId,
      godName,
      messages: [], // ← PUSTA!
      createdAt: new Date().toISOString(),
    }

    setCurrentSession(newSession)

    // Zapisz tylko jeśli to gość (zalogowani zapiszą przy pierwszej wiadomości)
    if (!user) {
      saveSession(newSession)
    }
  }

  const handleSelectionChange = (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => {
    initializeSession(mythologyId, mythologyName, godId, godName)
  }

  // Załaduj sesję z sidebara (nowa funkcja!)
  const loadSession = (session: any) => {
    setCurrentSession({
      id: session.id,
      mythologyId: session.mythology_id || session.mythologyId,
      mythologyName: session.mythologyName || 'Mitologia',
      godId: session.god_id || session.godId,
      godName: session.godName || null,
      messages: session.messages || [],
      createdAt: session.created_at || session.createdAt,
    })
  }

  // Expose loadSession via window (dla Sidebar)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).loadChatSession = loadSession
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentSession) return

    // Rate limit
    const canSend = checkRateLimit(!!user)
    if (!canSend) {
      setError(`Osiągnąłeś limit (${user ? '2' : '1'}/min). Poczekaj chwilę.`)
      setTimeout(() => setError(null), 5000)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...currentSession.messages, userMessage]
    const updatedSession = { ...currentSession, messages: updatedMessages }
    setCurrentSession(updatedSession)

    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Jeśli to pierwsza wiadomość zalogowanego usera, utwórz sesję w bazie
      if (user && currentSession.messages.length === 0) {
        const dbSession = await createSession(
          user.id,
          currentSession.mythologyId,
          currentSession.godId,
          currentSession.godName || currentSession.mythologyName,
          updatedMessages
        )
        updatedSession.id = dbSession.id // Zaktualizuj ID na bazodanowe
      } else if (user) {
        // Aktualizuj istniejącą sesję w bazie
        await updateSession(currentSession.id, updatedMessages)
      } else {
        // Gość - zapisz do localStorage
        saveSession(updatedSession)
      }

      // Wywołaj API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mythologyId: currentSession.mythologyId,
          mythologyName: currentSession.mythologyName,
          godId: currentSession.godId,
          godName: currentSession.godName,
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
      setCurrentSession(finalSession)

      // Zapisz finalną sesję
      if (user) {
        await updateSession(finalSession.id, finalMessages)
      } else {
        saveSession(finalSession)
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError('Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!currentSession) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  // Wiadomość powitalna (POZA messages!)
  const greetingMessage = currentSession.godName
    ? `Witaj, śmiertelniku. Jestem ${currentSession.godName}. Czego pragniesz ode mnie?`
    : `Witaj w świecie ${currentSession.mythologyName}. Jestem narratorem tej mitologii. O czym chcesz się dowiedzieć?`

  const hasMessages = currentSession.messages.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">
          {currentSession.godName || currentSession.mythologyName}
        </h2>
        <MythologySelector
          mythologies={mythologies}
          currentMythologyId={currentSession.mythologyId}
          currentGodId={currentSession.godId}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {/* Messages */}
      <div className="flex min-h-[400px] flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm">
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px]">
          {/* Powitanie (tylko jeśli brak wiadomości) */}
          {!hasMessages && (
            <div className="flex justify-center">
              <div className="max-w-[80%] rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center">
                <p className="text-amber-200">{greetingMessage}</p>
              </div>
            </div>
          )}

          {/* Wiadomości */}
          <AnimatePresence>
            {currentSession.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-zinc-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Odpowiadam...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400"
          >
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Wpisz swoją wiadomość..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-amber-600 p-3 text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-zinc-500">
          Limit: {user ? '2 wiadomości/min' : '1 wiadomość/min'}
        </p>
      </div>
    </div>
  )
}
