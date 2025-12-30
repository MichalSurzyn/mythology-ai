'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@lib/hooks/useAuth'
import { motion } from 'framer-motion'
import { User as UserIcon, History, LogOut } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import React from 'react'

interface UserMenuProps {
  user: User
  onClose: () => void
}

export default function UserMenu({ user, onClose }: UserMenuProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  // Zamknij przy kliknięciu poza menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSignOut = async () => {
    await signOut()
    onClose()
    // Przekieruj na landing page
    router.push('/')
    router.refresh()
  }

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-transparent p-2 shadow-xl"
    >
      {/* User info */}
      <div className="border-b border-accent px-3 py-3">
        <p className="text-sm font-medium text-white">{user.email}</p>
        <p className="text-xs text-zinc-400">Zalogowany</p>
      </div>

      {/* Menu items */}
      <div className="py-2">
        {/* <button
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          <UserIcon size={16} />
          Profil
        </button>

        <button
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          <History size={16} />
          Historia czatów
        </button> */}

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-accent transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={13} />
          Wyloguj się
        </button>
      </div>
    </motion.div>
  )
}
