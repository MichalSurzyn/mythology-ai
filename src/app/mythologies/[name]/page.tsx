import { notFound } from 'next/navigation'
import { getMythologyByName, getGodsByMythologyId } from '@lib/supabaseQueries'
import Link from 'next/link'
import React from 'react'

type Props = { params: Promise<{ name: string }> }

export async function generateMetadata({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  return { title: `${decodedName} | MythChat` }
}

export default async function MythologyPage({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const mythology = await getMythologyByName(decodedName).catch(() => null)

  if (!mythology) return notFound()

  const gods = await getGodsByMythologyId(mythology.id).catch(() => [])

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
            MythChat
          </p>
          <h1 className="text-5xl font-semibold text-gray-900 dark:text-white">
            {mythology.name}
          </h1>
        </div>

        <p className="text-lg leading-7 text-gray-700 dark:text-gray-300">
          {mythology.description || 'Brak opisu dla tej mitologii.'}
        </p>

        {/* Bogowie tej mitologii */}
        {gods.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Bogowie
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {gods.map((god) => (
                <Link
                  key={god.id}
                  href={`/gods/${encodeURIComponent(god.name)}`}
                  className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                    {god.name}
                  </h3>
                  {god.title && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {god.title}
                    </p>
                  )}
                  {god.domain && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {god.domain}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
