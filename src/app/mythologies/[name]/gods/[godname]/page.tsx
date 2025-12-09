import { notFound } from 'next/navigation'
import { getGodByName } from '@lib/supabase/queries/gods'
import { getMythologyByName } from '@lib/supabase/queries/mythologies'
import Link from 'next/link'
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

  // Pobierz mitologię dla breadcrumb i kolorów
  const mythology = await getMythologyByName(decodedMythologyName).catch(
    () => null
  )
  const accentColor = god.accent_color || mythology?.theme_color || '#FFD700'

  return (
    <main
      className="min-h-screen bg-black px-6 py-16"
      style={
        {
          '--accent-color': accentColor,
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-[var(--accent-color)]">
            Strona główna
          </Link>
          <span>/</span>
          {mythology && (
            <>
              <Link
                href={`/mythologies/${encodeURIComponent(mythology.name)}`}
                className="hover:text-[var(--accent-color)]"
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
              className="h-32 w-32 rounded-full object-cover shadow-lg"
              style={{ border: `3px solid ${accentColor}` }}
            />
          </div>
        )}

        {/* Główne informacje */}
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-semibold text-white">{god.name}</h1>
          {god.title && (
            <p className="text-xl" style={{ color: accentColor }}>
              {god.title}
            </p>
          )}
          {god.entity_type && god.entity_type !== 'god' && (
            <span
              className="inline-block px-3 py-1 text-sm rounded-full"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
              }}
            >
              {god.entity_type.charAt(0).toUpperCase() +
                god.entity_type.slice(1)}
            </span>
          )}
        </div>

        {/* Domena */}
        {god.domain && (
          <div
            className="rounded-lg border-2 p-4"
            style={{
              borderColor: accentColor,
              backgroundColor: `${accentColor}10`,
            }}
          >
            <p className="text-sm font-semibold text-white">Domena</p>
            <p className="mt-1 text-lg text-gray-200">{god.domain}</p>
          </div>
        )}

        {/* Opis */}
        {god.description && (
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">O tej postaci</h2>
            <p className="text-lg leading-7 text-gray-300">{god.description}</p>
          </div>
        )}

        {/* Osobowość */}
        {god.personality && (
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Osobowość</h2>
            <p className="text-lg leading-7 text-gray-300">{god.personality}</p>
          </div>
        )}

        {/* CTA - Czat (przygotowanie na przyszłość) */}
        <div className="pt-6 flex justify-center">
          <button
            className="px-6 py-3 rounded-lg font-semibold text-black transition hover:opacity-90"
            style={{ backgroundColor: accentColor }}
            disabled
          >
            💬 Porozmawiaj z {god.name} (wkrótce)
          </button>
        </div>
      </div>
    </main>
  )
}
