import { supabase } from '@lib/supabase/client'
import { Mythology, MythologyWithGods } from './types'

/**
 * Pobierz wszystkie mitologie z ich bogami (dla Sidebar)
 */
export async function getMythologiesWithGods(): Promise<MythologyWithGods[]> {
  const { data, error } = await supabase
    .from('mythologies')
    .select(
      `
      id,
      name,
      description,
      region,
      theme_color,
      image_url,
      system_prompt,
      created_at,
      gods!mythology_id (
        id,
        mythology_id,
        name,
        title,
        entity_type,
        domain,
        description,
        personality,
        system_prompt,
        accent_color,
        avatar_url,
        created_at
      )
    `
    )
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching mythologies with gods:', error)
    throw error
  }

  return (
    data?.map((myth) => ({
      ...myth,
      gods: myth.gods || [],
    })) || []
  )
}

/**
 * Pobierz szczegóły mitologii po nazwie
 */
export async function getMythologyByName(
  name: string
): Promise<Mythology | null> {
  const { data, error } = await supabase
    .from('mythologies')
    .select('*')
    .eq('name', name)
    .maybeSingle()

  if (error) {
    console.error('Error fetching mythology:', error)
    throw error
  }

  return data
}

/**
 * Pobierz mitologię po ID
 */
export async function getMythologyById(id: string): Promise<Mythology | null> {
  const { data, error } = await supabase
    .from('mythologies')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching mythology by ID:', error)
    throw error
  }

  return data
}

/**
 * Pobierz wszystkie mitologie (bez bogów - dla listy)
 */
export async function getMythologies(): Promise<
  Pick<Mythology, 'id' | 'name' | 'theme_color'>[]
> {
  const { data, error } = await supabase
    .from('mythologies')
    .select('id, name, theme_color')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching mythologies:', error)
    throw error
  }

  return data || []
}
