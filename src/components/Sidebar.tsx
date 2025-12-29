'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { MythologyWithGods } from '@lib/supabase/queries/types'
import { ChevronDown, Menu, X, History, Trash2 } from 'lucide-react'
import { useAuth } from '@lib/hooks/useAuth'
import { useTheme } from '@lib/contexts/ThemeContext'
import {
  getAllSessions,
  deleteSession as deleteLocalSession,
} from '@lib/utils/localStorage'
import {
  getUserSessions,
  deleteSession as deleteDbSession,
} from '@lib/supabase/queries/chat'
import React from 'react'

interface SidebarProps {
  mythologies: MythologyWithGods[]
}

export function Sidebar({ mythologies }: SidebarProps) {
  const router = useRouter()
  const { setAccent } = useTheme()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    loadSessions()
  }, [user])

  const loadSessions = async () => {
    if (user) {
      try {
        const sessions = await getUserSessions(user.id)
        const validSessions = sessions.filter(
          (s) => s.messages && s.messages.length > 0
        )
        setChatSessions(validSessions)
      } catch (error) {
        console.error('Error loading sessions:', error)
      }
    } else {
      const sessions = getAllSessions()
      const validSessions = sessions.filter(
        (s) => s.messages && s.messages.length > 0
      )
      setChatSessions(validSessions)
    }
  }

  const toggleExpanded = (mythologyId: string) => {
    setExpanded(expanded === mythologyId ? null : mythologyId)
  }

  const toggleMenu = () => {
    const newState = !isOpen
    setIsOpen(newState)

    // ✅ Odśwież sesje gdy otwierasz sidebar
    if (newState) {
      loadSessions()
    }
  }

  const handleLoadSession = async (session: any) => {
    // Ustaw kolor przed przekierowaniem
    const mythId = session.mythologyId || session.mythology_id
    const gId = session.godId || session.god_id

    await setAccent(mythId, gId)

    // ========================================
    // ✅ FIX: Zawsze dodaj parametry mythology i god do URL
    // Dzięki temu ChatContainer wie co ładować nawet bez DB query
    // ========================================
    const params = new URLSearchParams({
      mythology: mythId,
      ...(gId && { god: gId }),
    })

    router.push(`/chat/${session.id}?${params.toString()}`)
    setIsOpen(false)
  }

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    try {
      if (user) {
        await deleteDbSession(sessionId)
      } else {
        deleteLocalSession(sessionId)
      }
      loadSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={toggleMenu}
        className="fixed left-4 top-4 z-50 rounded-md bg-black p-2 text-white shadow-md hover:bg-zinc-800"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-black text-white shadow-md transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex h-full flex-col overflow-y-auto p-4 pt-16">
          <Link href="/" className="mb-4 block">
            <h2 className="text-lg font-semibold hover:text-accent transition-colors">
              MythChat
            </h2>
          </Link>

          {/* MITOLOGIE */}
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              Mitologie
            </h3>

            {mythologies.length === 0 ? (
              <p className="text-sm text-gray-400">Brak mitologii</p>
            ) : (
              <ul className="space-y-1">
                {mythologies.map((mythology) => (
                  <li key={mythology.id}>
                    <div className="flex items-center">
                      <Link
                        href={`/mythologies/${encodeURIComponent(
                          mythology.name
                        )}`}
                        className="flex-1 rounded px-2 py-2 text-sm font-medium hover:text-accent transition-colors"
                      >
                        {mythology.name}
                      </Link>
                      {mythology.gods.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(mythology.id)}
                          className="rounded p-1 hover:bg-zinc-700"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              expanded === mythology.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {expanded === mythology.id && mythology.gods.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-1 border-l border-gray-700">
                        {mythology.gods.map((god) => (
                          <li key={god.id}>
                            <Link
                              href={`/mythologies/${encodeURIComponent(
                                mythology.name
                              )}/gods/${encodeURIComponent(god.name)}`}
                              className="block rounded px-2 py-1 text-sm hover:text-accent transition-colors"
                            >
                              {god.name}
                              {god.title && (
                                <span className="text-xs text-gray-400">
                                  {' '}
                                  ({god.title})
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* HISTORIA */}
          <div className="space-y-2 border-t border-gray-700 pt-4">
            <div className="flex items-center gap-2">
              <History size={16} />
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                Historia
              </h3>
            </div>

            {chatSessions.length === 0 ? (
              <p className="text-xs text-gray-400">Brak historii</p>
            ) : (
              <ul className="space-y-1">
                {chatSessions.slice(0, 10).map((session) => (
                  <li
                    key={session.id}
                    className="group flex items-center justify-between rounded px-2 py-2 text-sm hover:bg-zinc-800"
                  >
                    <button
                      onClick={() => handleLoadSession(session)}
                      className="flex-1 truncate text-left text-gray-300 hover:text-accent transition-colors"
                    >
                      {session.session_name ||
                        session.godName ||
                        session.mythologyName}
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 z-30 bg-black/50"
          aria-hidden="true"
        />
      )}
    </>
  )
}
