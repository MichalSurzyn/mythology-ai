'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MythologyWithGods } from '@lib/supabaseQueries'
import { ChevronDown, Menu, X } from 'lucide-react'
import React from 'react'

interface SidebarProps {
  mythologies: MythologyWithGods[]
}

export function Sidebar({ mythologies }: SidebarProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const toggleExpanded = (mythologyId: string) => {
    setExpanded(expanded === mythologyId ? null : mythologyId)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Ikona hamburgera */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-md shadow-md hover:font-bold"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-black text-white shadow-md transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 pt-16 flex-1 overflow-y-auto">
          <Link href="/" className="block mb-4">
            <h2 className="text-lg font-semibold hover:text-amber-500">
              MythChat
            </h2>
          </Link>

          <div className="space-y-2">
            <h3 className="text-sm uppercase tracking-wide font-semibold">
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
                        className="flex-1 hover:text-amber-500 px-2 py-2 rounded text-sm font-medium"
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
                          className="p-1 hover:bg-gray-700 rounded"
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
                              href={`/gods/${encodeURIComponent(god.name)}`}
                              className="block text-sm hover:text-amber-500 px-2 py-1 rounded"
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
