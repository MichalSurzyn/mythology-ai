import ChatContainer from '@/components/chat/ChatContainer'
import GalaxyThemed from '@/components/backgrounds/GalaxyThemed'
import React from 'react'

type Props = {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ChatPage({ params, searchParams }: Props) {
  const { sessionId } = await params
  const search = await searchParams

  // ✅ Nie fetchujemy mythologies - dane są już w ThemeContext!

  // Wyciągnij parametry
  const initialQuery = typeof search.q === 'string' ? search.q : undefined
  const mythologyId =
    typeof search.mythology === 'string' ? search.mythology : undefined
  const godId = typeof search.god === 'string' ? search.god : undefined

  return (
    <>
      {/* TŁO GALAXY */}
      {/* <div className="fixed inset-0 z-0 w-full h-full overflow-hidden">
        <GalaxyThemed />
      </div> */}

      {/* CHAT CONTENT */}
      <div className="relative z-10">
        <ChatContainer
          sessionId={sessionId}
          initialQuery={initialQuery}
          mythologyId={mythologyId}
          godId={godId}
        />
      </div>
    </>
  )
}
