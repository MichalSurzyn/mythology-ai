import { notFound } from 'next/navigation'
import { getGodByName, getMythologyByName } from '@lib/supabaseQueries'
import Link from 'next/link'
import React from 'react'

type Props = { params: Promise<{ name: string }> }

export async function generateMetadata({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  return { title: `${decodedName} | MythChat` }
}

export default async function GodPage({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const god = await getGodByName(decodedName).catch(() => null)

  if (!god) return notFound()

  return (
    <main className="min-h-screen bg-black px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-amber-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-300">{god.name}</span>
        </div>

        {/* Avatar (jeśli istnieje) */}
        {god.avatar_url && (
          <div className="flex justify-center">
            <img
              src={god.avatar_url}
              alt={god.name}
              className="h-32 w-32 rounded-full object-cover shadow-lg"
            />
          </div>
        )}

        {/* Główne informacje */}
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-semibold text-white">{god.name}</h1>
          {god.title && <p className="text-xl text-amber-400">{god.title}</p>}
        </div>

        {/* Domena */}
        {god.domain && (
          <div className="rounded-lg border-2 border-white-600 bg-amber-400 p-4">
            <p className="text-sm font-semibold text-black">Domena</p>
            <p className="mt-1 text-lg text-black">{god.domain}</p>
          </div>
        )}

        {/* Opis */}
        {god.description && (
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">O tym bogu</h2>
            <p className="text-lg leading-7 text-gray-300">{god.description}</p>
          </div>
        )}
      </div>
    </main>
  )
}
