'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MythologyWithGods } from '@lib/supabase/queries/types'
import { ChevronDown, Menu, X, History, Trash2 } from 'lucide-react'
import { useAuth } from '@lib/hooks/useAuth'
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
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<any[]>([])
  const { user } = useAuth()

  // Załaduj sesje (localStorage lub baza)
  useEffect(() => {
    async function loadSessions() {
      if (user) {
        // Zalogowany - pobierz z bazy
        try {
          const sessions = await getUserSessions(user.id)
          setChatSessions(sessions)
        } catch (error) {
          console.error('Error loading sessions:', error)
        }
      } else {
        // Gość - pobierz z localStorage
        const sessions = getAllSessions()
        setChatSessions(sessions)
      }
    }

    loadSessions()
  }, [user])

  const toggleExpanded = (mythologyId: string) => {
    setExpanded(expanded === mythologyId ? null : mythologyId)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (user) {
      await deleteDbSession(sessionId)
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } else {
      deleteLocalSession(sessionId)
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId))
    }
  }

  return (
    <>
      {/* Ikona hamburgera */}
      <button
        onClick={toggleMenu}
        className="fixed left-4 top-4 z-50 rounded-md bg-black p-2 text-white shadow-md hover:font-bold"
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
            <h2 className="text-lg font-semibold hover:text-amber-500">
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
                        className="flex-1 rounded px-2 py-2 text-sm font-medium hover:text-amber-500"
                        style={
                          {
                            '--hover-color': mythology.theme_color,
                          } as React.CSSProperties
                        }
                      >
                        {mythology.name}
                      </Link>
                      {mythology.gods.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(mythology.id)}
                          className="rounded p-1 hover:bg-gray-700"
                          aria-label={
                            expanded === mythology.id
                              ? 'Zwiń bogów'
                              : 'Rozwiń bogów'
                          }
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

                    {/* Rozwijalne menu bogów */}
                    {expanded === mythology.id && mythology.gods.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-1 border-l border-gray-700">
                        {mythology.gods.map((god) => (
                          <li key={god.id}>
                            <Link
                              href={`/mythologies/${encodeURIComponent(
                                mythology.name
                              )}/gods/${encodeURIComponent(god.name)}`}
                              className="block rounded px-2 py-1 text-sm hover:text-amber-500"
                              style={
                                {
                                  '--hover-color':
                                    god.accent_color || mythology.theme_color,
                                } as React.CSSProperties
                              }
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

          {/* HISTORIA CZATÓW */}
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
                    className="group flex items-center justify-between rounded px-2 py-2 text-sm hover:bg-gray-800"
                  >
                    <button
                      onClick={() => {
                        // TODO: Załaduj sesję do czatu
                        console.log('Load session:', session.id)
                      }}
                      className="flex-1 truncate text-left text-gray-300 hover:text-amber-500"
                    >
                      {session.session_name ||
                        session.godName ||
                        session.mythologyName}
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                      aria-label="Usuń sesję"
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
        ></div>
      )}
    </>
  )
}
