'use client'

import React from 'react'

interface ChatHeaderProps {
  title: string
}

export default function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <h1 className="text-2xl font-runewood text-white">MythChat</h1>
        <p className="text-sm text-zinc-400">{title}</p>
      </div>
    </header>
  )
}
