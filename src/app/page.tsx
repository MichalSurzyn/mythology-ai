import Link from 'next/link'
import { getMythologies, testSupabaseConnection } from '@lib/supabaseQueries'
import TypingText from '@/components/TypingText'
import React from 'react'

export const revalidate = 0 // zawsze świeże dane z Supabase (SSR)

export default async function Home() {
  await testSupabaseConnection() // Tymczasowe logowanie danych
  const mythologies = await getMythologies().catch(() => [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900 dark:from-black dark:to-zinc-950">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Welcome to
        </p>
        <h1 className="text-5xl font-runewood tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
          MythChat
        </h1>
        <TypingText
          text="Interaktywna strona internetowa o mitologii integrująca model językowy"
          className="max-w-2xl font-Italianno text-5xl text-zinc-600 dark:text-zinc-300"
        />
      </div>

      <section className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Mitologie
          </h2>
        </div>

        {mythologies.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Brak danych w tabeli MYTHOLOGIES.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {mythologies.map(({ name }) => (
              <Link
                key={name}
                href={`/mythologies/${encodeURIComponent(name)}`}
                className="group rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/70"
              >
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {name}
                </div>
                <span className="text-sm text-zinc-500 group-hover:text-amber-600 dark:text-zinc-400 dark:group-hover:text-amber-400">
                  Poznaj szczegóły
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
