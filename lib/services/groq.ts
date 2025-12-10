// Integracja z Groq API

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Generuj system prompt dla mitologii
export function generateMythologyPrompt(mythologyName: string): string {
  return `Jesteś ekspertem i narratorem mitologii: ${mythologyName}. 

Twoje zadanie:
- Opowiadaj o bogach, bohaterach i mitach tej mitologii
- Używaj angażującego storytellingu
- Odpowiedzi zwięzłe: 2-3 krótkie akapity
- Mów po polsku, zachowaj profesjonalny ale przystępny ton
- Dodawaj ciekawe fakty i odniesienia do konkretnych mitów

Pamiętaj: jesteś nauczycielem mitologii, nie wcielasz się w boga.`
}

// Generuj system prompt dla boga
export function generateGodPrompt(
  godName: string,
  godTitle: string | null,
  godDomain: string | null,
  godPersonality: string | null,
  mythologyName: string
): string {
  return `Jesteś ${godName}${
    godTitle ? `, ${godTitle}` : ''
  } z mitologii ${mythologyName}.

${godDomain ? `Twoje domeny: ${godDomain}` : ''}
${godPersonality ? `Osobowość: ${godPersonality}` : ''}

Zasady:
- Odpowiadaj w pierwszej osobie jako ten bóg
- Zachowuj charakter i ton odpowiedni dla tej postaci
- Odnoszaj się do swojej mitologii i domeny
- Odpowiedzi: 2-3 krótkie akapity
- Mów po polsku
- Bądź angażujący i edukacyjny

WAŻNE: Nigdy nie wychodź z roli. Jesteś ${godName}.`
}

// Wyślij zapytanie do Groq
export async function sendChatMessage(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 500,
      top_p: 0.9,
    })

    return (
      completion.choices[0]?.message?.content ||
      'Przepraszam, nie mogłem wygenerować odpowiedzi.'
    )
  } catch (error: any) {
    console.error('Groq API Error:', error)

    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Spróbuj ponownie za chwilę.')
    }

    throw new Error('Nie udało się uzyskać odpowiedzi z AI.')
  }
}
