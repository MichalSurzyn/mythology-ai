'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, AlertCircle } from 'lucide-react'
import MythologySelector from './MythologySelector'
import React from 'react'

interface ChatInputProps {
  mythologies: any[]
  currentMythologyId: string
  currentGodId: string | null
  onSend: (content: string) => void
  onSelectionChange: (
    mythologyId: string,
    mythologyName: string,
    godId: string | null,
    godName: string | null
  ) => void
  isLoading: boolean
  error: string | null
  isLoggedIn: boolean
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
}: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSend(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-6 py-4">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        {/* Input */}
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Wpisz swoją wiadomość..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-amber-600 p-3 text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Selektory pod inputem */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <MythologySelector
            mythologies={mythologies}
            currentMythologyId={currentMythologyId}
            currentGodId={currentGodId}
            onSelectionChange={onSelectionChange}
          />
          <span className="text-xs text-zinc-500">
            Limit: {isLoggedIn ? '2' : '1'}/min
          </span>
        </div>
      </div>
    </div>
  )
}
