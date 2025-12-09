import { supabase } from './supabaseClient'

// =====================================================
// TYPY (tymczasowe, ręcznie napisane)
// =====================================================
export type God = {
  id: string
  mythology_id: string
  name: string
  title: string | null
  entity_type: string
  domain: string | null
  description: string | null
  personality: string | null
  system_prompt: string | null
  accent_color: string | null
  avatar_url: string | null
  created_at: string
}

export type Mythology = {
  id: string
  name: string
  description: string | null
  region: string | null
  system_prompt: string | null
  theme_color: string
  image_url: string | null
  created_at: string
}

export type MythologyWithGods = Mythology & {
  gods: God[]
}

// =====================================================
// QUERIES - Mitologie
// =====================================================

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

// =====================================================
// UTILITY - Test połączenia
// =====================================================

export async function testSupabaseConnection() {
  const { data, error } = await supabase.from('mythologies').select('*')

  if (error) {
    console.error('Supabase connection error:', error)
    return null
  }

  console.log('✅ Supabase connected! Mythologies:', data)
  return data
}
