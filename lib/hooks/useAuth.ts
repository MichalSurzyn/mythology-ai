'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@lib/supabase/client'
import { clearAllSessions } from '@lib/utils/localStorage'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pobierz aktualnego usera
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Subskrybuj zmiany auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null

      // ✅ NOWE: Wyczyść localStorage gdy user się loguje
      if (newUser && !user) {
        console.log('🧹 User logged in - clearing localStorage sessions')
        clearAllSessions()
      }

      setUser(newUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // ✅ NOWE: Wyczyść localStorage po zalogowaniu
    if (!error && data.user) {
      console.log('🧹 Sign in successful - clearing localStorage sessions')
      clearAllSessions()
    }

    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    // ✅ OPCJONALNE: Możesz też wyczyścić przy wylogowaniu (lub nie)
    // if (!error) {
    //   clearAllSessions()
    // }

    return { error }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }
}
