import { notFound } from 'next/navigation'
import { getMythologyByName } from '@lib/supabase/queries/mythologies'
import { getGodsByMythologyId } from '@lib/supabase/queries/gods'
import Link from 'next/link'
import ThemeSetter from '@/components/ThemeSetter'
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
    <>
      {/* ✅ ThemeSetter ustawi kolor mitologii */}
      <ThemeSetter mythologyId={mythology.id} />

      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-accent transition-colors">
              Strona główna
            </Link>
            <span>/</span>
            <span className="text-gray-300">{mythology.name}</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-accent">
              MythChat
            </p>
            <h1 className="text-5xl font-semibold text-white">
              {mythology.name}
            </h1>
            {mythology.region && (
              <p className="text-sm text-gray-400">📍 {mythology.region}</p>
            )}
          </div>

          {/* Opis */}
          <p className="text-lg leading-7 text-gray-300">
            {mythology.description || 'Brak opisu dla tej mitologii.'}
          </p>

          {/* Bogowie */}
          {gods.length > 0 && (
            <section className="mt-12 space-y-4">
              <h2 className="text-3xl font-semibold text-white">
                Bogowie i Postacie
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {gods.map((god) => {
                  const godAccent = god.accent_color || mythology.theme_color

                  return (
                    <Link
                      key={god.id}
                      href={`/mythologies/${name}/gods/${encodeURIComponent(
                        god.name
                      )}`}
                      className="group rounded-lg border border-gray-700 bg-card p-4 shadow-sm transition hover:shadow-lg hover:border-accent"
                    >
                      <div className="flex items-start gap-3">
                        {god.avatar_url && (
                          <img
                            src={god.avatar_url}
                            alt={god.name}
                            className="h-12 w-12 rounded-full object-cover"
                            style={{
                              border: `2px solid ${godAccent}`,
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-accent">
                            {god.name}
                          </h3>
                          {god.title && (
                            <p className="text-sm text-gray-400">{god.title}</p>
                          )}
                          {god.domain && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: godAccent }}
                            >
                              {god.domain}
                            </p>
                          )}
                          {god.entity_type && god.entity_type !== 'god' && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-zinc-700 text-gray-300">
                              {god.entity_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
