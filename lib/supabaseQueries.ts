import { supabase } from './supabaseClient'

export type God = {
  id: string
  name: string
  title: string | null
  domain: string | null
  description: string | null
  personality: string | null
  avatar_url: string | null
  mythology_id: string
}

export type MythologyWithGods = {
  id: string
  name: string
  description: string | null
  gods: God[]
}

export type Mythology = {
  name: string
  description: string | null
}

// Pobierz wszystkie mitologie z ich bogami (dla menu sidebar)
export async function getMythologiesWithGods(): Promise<MythologyWithGods[]> {
  const { data, error } = await supabase
    .from('MYTHOLOGIES')
    .select(
      'id, name, description, GODS(id, name, title, domain, description, personality, avatar_url, mythology_id)'
    )
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching mythologies with gods:', error)
    throw error
  }

  return (
    data?.map((myth) => ({
      id: myth.id,
      name: myth.name,
      description: myth.description,
      gods: myth.GODS || [],
    })) || []
  )
}

// Pobierz szczegóły mitologii po nazwie
export async function getMythologyByName(name: string) {
  const { data, error } = await supabase
    .from('MYTHOLOGIES')
    .select('id, name, description')
    .eq('name', name)
    .maybeSingle()

  if (error) throw error
  return data
}

// Pobierz wszystkie mitologie (bez bogów - dla zwykłej listy)
export async function getMythologies() {
  const { data, error } = await supabase
    .from('MYTHOLOGIES')
    .select('name')
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

// Pobierz szczegóły boga po nazwie
export async function getGodByName(name: string) {
  const { data, error } = await supabase
    .from('GODS')
    .select(
      'id, name, title, domain, description, personality, avatar_url, mythology_id'
    )
    .eq('name', name)
    .maybeSingle()

  if (error) {
    console.error('Error fetching god:', error)
    throw error
  }
  return data
}

// Pobierz bogów dla konkretnej mitologii (na wypadek potrzeby)
export async function getGodsByMythologyId(mythology_id: string) {
  const { data, error } = await supabase
    .from('GODS')
    .select('id, name, title, domain, description, personality, avatar_url')
    .eq('mythology_id', mythology_id)
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function testSupabaseConnection() {
  const { data, error } = await supabase.from('MYTHOLOGIES').select('*')
  if (error) {
    console.error('Supabase connection error:', error)
    return null
  }
  console.log('Supabase data:', data)
  return data
}
