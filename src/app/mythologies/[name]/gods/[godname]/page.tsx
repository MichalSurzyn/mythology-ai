import { notFound } from 'next/navigation'
import { getGodByName } from '@lib/supabase/queries/gods'
import { getMythologyByName } from '@lib/supabase/queries/mythologies'
import Link from 'next/link'
import ThemeSetter from '@/components/ThemeSetter'
import React from 'react'

type Props = { params: Promise<{ name: string; godname: string }> }

export async function generateMetadata({ params }: Props) {
  const { godname } = await params
  const decodedName = decodeURIComponent(godname)
  return { title: `${decodedName} | MythChat` }
}

export default async function GodPage({ params }: Props) {
  const { name, godname } = await params
  const decodedMythologyName = decodeURIComponent(name)
  const decodedGodName = decodeURIComponent(godname)

  const god = await getGodByName(decodedGodName).catch(() => null)

  if (!god) return notFound()

  // Pobierz mitologię dla breadcrumb
  const mythology = await getMythologyByName(decodedMythologyName).catch(
    () => null
  )
  const accentColor = god.accent_color || mythology?.theme_color || '#FFD700'

  return (
    <>
      {/* ✅ ThemeSetter ustawi kolor BOGA (priorytet) */}
      <ThemeSetter mythologyId={god.mythology_id} godId={god.id} />

      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-accent transition-colors">
              Strona główna
            </Link>
            <span>/</span>
            {mythology && (
              <>
                <Link
                  href={`/mythologies/${encodeURIComponent(mythology.name)}`}
                  className="hover:text-accent transition-colors"
                >
                  {mythology.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-300">{god.name}</span>
          </div>

          {/* Avatar */}
          {god.avatar_url && (
            <div className="flex justify-center">
              <img
                src={god.avatar_url}
                alt={god.name}
                className="h-32 w-32 rounded-full object-cover shadow-lg border-4 border-accent"
              />
            </div>
          )}

          {/* Główne informacje */}
          <div className="space-y-2 text-center">
            <h1 className="text-5xl font-semibold text-white">{god.name}</h1>
            {god.title && <p className="text-xl text-accent">{god.title}</p>}
            {god.entity_type && god.entity_type !== 'god' && (
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-accent-20 text-accent">
                {god.entity_type.charAt(0).toUpperCase() +
                  god.entity_type.slice(1)}
              </span>
            )}
          </div>

          {/* Domena */}
          {god.domain && (
            <div className="rounded-lg border-2 border-accent bg-accent-10 p-4">
              <p className="text-sm font-semibold text-white">Domena</p>
              <p className="mt-1 text-lg text-gray-200">{god.domain}</p>
            </div>
          )}

          {/* Opis */}
          {god.description && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                O tej postaci
              </h2>
              <p className="text-lg leading-7 text-gray-300">
                {god.description}
              </p>
            </div>
          )}

          {/* Osobowość */}
          {god.personality && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">Osobowość</h2>
              <p className="text-lg leading-7 text-gray-300">
                {god.personality}
              </p>
            </div>
          )}

          {/* CTA - Czat */}
          <div className="pt-6 flex justify-center">
            <Link
              href={`/chat/${god.id}?mythology=${god.mythology_id}&god=${god.id}`}
              className="px-6 py-3 rounded-lg font-semibold text-black bg-accent transition hover:opacity-90"
            >
              💬 Porozmawiaj z {god.name}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
