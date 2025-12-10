import { supabase } from '@lib/supabase/client'

export type ChatSession = {
  id: string
  user_id: string
  mythology_id: string
  god_id: string | null
  session_name: string
  messages: any
  created_at: string
  updated_at: string
  last_message_at: string
}

/**
 * Pobierz sesje użytkownika
 */
export async function getUserSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    throw error
  }

  return data || []
}

/**
 * Utwórz nową sesję
 */
export async function createSession(
  userId: string,
  mythologyId: string,
  godId: string | null,
  sessionName: string,
  messages: any[]
): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      mythology_id: mythologyId,
      god_id: godId,
      session_name: sessionName,
      messages: messages,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    throw error
  }

  return data
}

/**
 * Zaktualizuj sesję
 */
export async function updateSession(
  sessionId: string,
  messages: any[]
): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({
      messages: messages,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating session:', error)
    throw error
  }
}

/**
 * Usuń sesję
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('Error deleting session:', error)
    throw error
  }
}

/**
 * Przenieś sesje z localStorage do bazy
 */
export async function migrateSessions(
  userId: string,
  sessions: any[]
): Promise<void> {
  const sessionsToInsert = sessions.map((session) => ({
    user_id: userId,
    mythology_id: session.mythologyId,
    god_id: session.godId,
    session_name: session.godName || session.mythologyName,
    messages: session.messages,
    created_at: session.createdAt,
    last_message_at:
      session.messages[session.messages.length - 1]?.timestamp ||
      session.createdAt,
  }))

  const { error } = await supabase
    .from('chat_sessions')
    .insert(sessionsToInsert)

  if (error) {
    console.error('Error migrating sessions:', error)
    throw error
  }
}
