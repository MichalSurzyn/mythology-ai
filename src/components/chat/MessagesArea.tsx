'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import React from 'react'

interface MessagesAreaProps {
  messages: any[]
  greetingMessage: string
  isLoading: boolean
}

export default function MessagesArea({
  messages,
  greetingMessage,
  isLoading,
}: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Powitanie (jeśli brak wiadomości) */}
        {messages.length === 0 && (
          <div className="flex justify-center">
            <div className="max-w-[80%] rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center">
              <p className="text-amber-200">{greetingMessage}</p>
            </div>
          </div>
        )}

        {/* Wiadomości */}
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Loading */}
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
  )
}
