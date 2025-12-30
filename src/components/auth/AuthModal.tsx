'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@lib/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle } from 'lucide-react'
import React from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } =
        mode === 'login'
          ? await signIn(email, password)
          : await signUp(email, password)

      if (authError) {
        setError(authError.message)
      } else {
        onClose()
        setEmail('')
        setPassword('')
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        /* Główny kontener pozycjonujący (zamiast fixed na samym modalu) */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay - Tło strony (ciemniejsze: bg-black/90) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
          />

          {/* Modal - Czarne tło, brak translate, position relative */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            /* Zatrzymujemy propagację kliknięcia, aby klik w modal nie zamykał go */
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-black p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-400">
                {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-400 placeholder-zinc-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#000_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                  placeholder="twoj@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Hasło
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-400 placeholder-zinc-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#000_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-medium text-zinc-400 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
              </button>
            </form>

            {/* Toggle mode */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError(null)
                }}
                className="text-sm text-zinc-400 hover:text-accent"
              >
                {mode === 'login'
                  ? 'Nie masz konta? Zarejestruj się'
                  : 'Masz już konto? Zaloguj się'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
