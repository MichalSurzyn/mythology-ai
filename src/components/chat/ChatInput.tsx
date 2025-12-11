// src/components/chat/ChatInput.tsx
'use client'

import { useRef, useState, KeyboardEvent, useEffect } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import MythologySelector from '@/components/chat/MythologySelector'
import React from 'react'

interface ChatInputProps {
  mythologies: any[]
  currentMythologyId: string
  currentGodId: string | null
  onSend: (message: string) => void | Promise<void>
  onSelectionChange: (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => void
  isLoading: boolean
  error: string | null
  isLoggedIn: boolean
  placeholder?: string
}

export default function ChatInput({
  mythologies,
  currentMythologyId,
  currentGodId,
  onSend,
  onSelectionChange,
  isLoading,
  error,
  isLoggedIn,
  placeholder = 'Zadaj pytanie...',
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const disabled = isLoading

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input)
    setInput('')
    // Reset wysokości po wysłaniu
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    // ZMIANA: Pełna szerokość, border na górze, tło dopasowane do reszty (czarne/przezroczyste)
    <div className="w-full border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md pb-6 pt-4">
      {/* Error */}
      {error && (
        <div className="mx-auto mb-3 flex max-w-7xl items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="mx-auto flex max-w-7xl gap-4 px-6 sm:px-8">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          // Styl minimalistyczny ("terminalowy")
          className="flex-1 resize-none bg-transparent px-2 py-3 text-xl text-white placeholder-zinc-600 focus:outline-none focus:placeholder-zinc-500 disabled:opacity-50"
          style={{ minHeight: '60px', maxHeight: '200px' }}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="self-end rounded-full bg-accent hover:opacity-90 p-4 text-white transition  disabled:cursor-not-allowed disabled:opacity-50 mb-1"
        >
          <Send size={24} />
        </button>
      </div>

      {/* Selektory + info */}
      <div className="mx-auto mt-3 flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 sm:px-8 text-xs text-zinc-400">
        <MythologySelector
          mythologies={mythologies}
          currentMythologyId={currentMythologyId}
          currentGodId={currentGodId}
          onSelectionChange={onSelectionChange}
        />
        <span className="text-[11px]">Limit: {isLoggedIn ? '2' : '1'}/min</span>
      </div>
    </div>
  )
}
