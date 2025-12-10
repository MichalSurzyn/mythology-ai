'use client'

import { useState } from 'react'
import { useAuth } from '@lib/hooks/useAuth'
import AuthModal from './AuthModal'
import UserMenu from './UserMenu'
import { User, LogIn } from 'lucide-react'
import React from 'react'

export default function UserButton() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  if (loading) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    // Niezalogowany
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
        >
          <LogIn size={18} />
          <span className="hidden sm:inline">Zaloguj się</span>
        </button>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  // Zalogowany
  const displayName = user.email?.split('@')[0] || 'User'

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:border-amber-500"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold">
          {displayName[0].toUpperCase()}
        </div>
        <span className="hidden sm:inline">{displayName}</span>
      </button>

      {showUserMenu && (
        <UserMenu user={user} onClose={() => setShowUserMenu(false)} />
      )}
    </div>
  )
}
