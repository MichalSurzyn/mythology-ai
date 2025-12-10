import { getMythologies } from '@lib/supabase/queries/mythologies'
import ChatContainer from '@/components/chat/ChatContainer'
import React from 'react'

type Props = {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ChatPage({ params, searchParams }: Props) {
  const { sessionId } = await params
  const search = await searchParams

  const mythologies = await getMythologies().catch(() => [])

  // Wyciągnij parametry
  const initialQuery = typeof search.q === 'string' ? search.q : undefined
  const mythologyId =
    typeof search.mythology === 'string' ? search.mythology : undefined
  const godId = typeof search.god === 'string' ? search.god : undefined

  return (
    <ChatContainer
      sessionId={sessionId}
      mythologies={mythologies}
      initialQuery={initialQuery}
      mythologyId={mythologyId}
      godId={godId}
    />
  )
}
