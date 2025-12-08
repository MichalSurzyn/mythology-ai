import { notFound } from 'next/navigation'
import { getMythologyByName } from '@lib/supabaseQueries'
import React from 'react'

type Props = { params: Promise<{ name: string }> }

export async function generateMetadata({ params }: Props) {
  const { name } = await params // Rozpakowanie asynchronicznego params
  const decodedName = decodeURIComponent(name)
  return { title: `${decodedName} | MythChat` }
}

export default async function MythologyPage({ params }: Props) {
  const { name } = await params // Rozpakowanie asynchronicznego params
  const decodedName = decodeURIComponent(name)
  const mythology = await getMythologyByName(decodedName).catch(() => null)

  if (!mythology) return notFound()

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
            MythChat
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900 dark:text-white">
            {mythology.name}
          </h1>
        </div>
        <p className="text-lg leading-7 text-zinc-700 dark:text-zinc-300">
          {mythology.description || 'Brak opisu dla tej mitologii.'}
        </p>
      </div>
    </main>
  )
}
