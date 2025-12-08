import { supabase } from './supabaseClient'

export type Mythology = {
  name: string
  description: string | null
}

export async function getMythologies() {
  const { data, error } = await supabase
    .from('MYTHOLOGIES')
    .select('name')
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getMythologyByName(name: string) {
  const { data, error } = await supabase
    .from('MYTHOLOGIES')
    .select('name, description')
    .eq('name', name)
    .maybeSingle()

  if (error) throw error
  return data
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
