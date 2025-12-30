'use client'

import { motion } from 'framer-motion'
import AnimatedBorder from './AnimatedBorder'
import { useTheme } from '@lib/contexts/ThemeContext'
import React from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface MessageBubbleProps {
  message: Message
  godName?: string | null
}

export default function MessageBubble({
  message,
  godName,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const { accentColor } = useTheme()

  // ========================================
  // Electric border TYLKO dla Thor i Zeus
  // ========================================
  const isElectricGod =
    godName && ['thor', 'zeus'].includes(godName.toLowerCase())
  const borderType = isUser ? 'star' : isElectricGod ? 'electric' : 'star'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <AnimatedBorder
        type={borderType}
        className="max-w-[80%]"
        accentColor={accentColor}
      >
        <div className="rounded-2xl px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-100">
            {message.content}
          </p>
          <p className="mt-1 text-xs opacity-60 text-gray-300">
            {new Date(message.timestamp).toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </AnimatedBorder>
    </motion.div>
  )
}
