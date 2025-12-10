import { NextRequest, NextResponse } from 'next/server'
import {
  sendChatMessage,
  generateMythologyPrompt,
  generateGodPrompt,
} from '@lib/services/groq'
import { getMythologyById } from '@lib/supabase/queries/mythologies'
import { getGodById } from '@lib/supabase/queries/gods'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mythologyId, mythologyName, godId, godName, messages } = body

    if (!mythologyId || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let systemPrompt: string

    if (godId) {
      // Tryb boga - pobierz szczegóły
      const god = await getGodById(godId)

      if (!god) {
        return NextResponse.json({ error: 'God not found' }, { status: 404 })
      }

      systemPrompt =
        god.system_prompt ||
        generateGodPrompt(
          god.name,
          god.title,
          god.domain,
          god.personality,
          mythologyName
        )
    } else {
      // Tryb mitologii
      const mythology = await getMythologyById(mythologyId)

      systemPrompt =
        mythology?.system_prompt || generateMythologyPrompt(mythologyName)
    }

    // Ogranicz historię do ostatnich 10 wiadomości
    const recentMessages = messages.slice(-10)

    // Wywołaj Groq
    const response = await sendChatMessage(recentMessages, systemPrompt)

    return NextResponse.json({
      content: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
