import { supabase } from '../client'
import type { God } from './types'

// =====================================================
// QUERIES - Bogowie
// =====================================================

/**
 * Pobierz szczegóły boga po nazwie
 */
export async function getGodByName(name: string): Promise<God | null> {
  const { data, error } = await supabase
    .from('gods')
    .select('*')
    .eq('name', name)
    .maybeSingle()

  if (error) {
    console.error('Error fetching god:', error)
    throw error
  }

  return data
}

/**
 * Pobierz boga po ID
 */
export async function getGodById(id: string): Promise<God | null> {
  const { data, error } = await supabase
    .from('gods')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching god by ID:', error)
    throw error
  }

  return data
}

/**
 * Pobierz bogów dla konkretnej mitologii
 */
export async function getGodsByMythologyId(
  mythologyId: string
): Promise<God[]> {
  const { data, error } = await supabase
    .from('gods')
    .select('*')
    .eq('mythology_id', mythologyId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching gods:', error)
    throw error
  }

  return data || []
}
