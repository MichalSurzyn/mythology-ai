import { notFound } from 'next/navigation'
import { getGodByName } from '@lib/supabase/queries/gods'
import { getMythologyByName } from '@lib/supabase/queries/mythologies'
import Link from 'next/link'
import ThemeSetter from '@/components/ThemeSetter'
import ThemedSVG from '@/components/ThemedSVG'
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

  const mythology = await getMythologyByName(decodedMythologyName).catch(
    () => null
  )

  // ✅ URL avatara (priorytet: avatar_url → icon_url → mythology fallback)
  const avatarUrl = god.avatar_url || god.icon_url || mythology?.image_url || ''

  return (
    <>
      <ThemeSetter mythologyId={god.mythology_id} godId={god.id} />

      <main className="relative min-h-screen px-6 py-16 overflow-hidden">
        {/* ✅ LEFT AVATAR - absolute, 70% wysokości, za tekstem */}
        {avatarUrl && (
          <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none">
            <ThemedSVG src={avatarUrl} alt={god.name} size="xlarge" />
          </div>
        )}

        {/* ✅ RIGHT AVATAR - absolute, flipped, 70% wysokości */}
        {avatarUrl && (
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none">
            <ThemedSVG
              src={avatarUrl}
              alt={god.name}
              size="xlarge"
              flip={true}
            />
          </div>
        )}

        {/* ✅ CONTENT - z-index wyższy niż avatary */}
        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
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

          {/* ✅ Mobile Avatar (centered, tylko na mobile) */}
          {avatarUrl && (
            <div className="flex lg:hidden justify-center mb-8">
              <ThemedSVG src={avatarUrl} alt={god.name} size="large" />
            </div>
          )}

          {/* Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Główne informacje */}
            <div className="space-y-2">
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

            {/* CTA */}
            <div className="pt-6 flex justify-center lg:justify-start">
              <Link
                href={`/chat/${god.id}?mythology=${god.mythology_id}&god=${god.id}`}
                className="px-6 py-3 rounded-lg font-semibold bg-accent text-black hover:opacity-90 transition"
              >
                💬 Rozpocznij czat z {god.name}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
