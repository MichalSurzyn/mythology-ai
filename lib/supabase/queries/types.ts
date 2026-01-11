// lib/supabase/queries/types.ts

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
  icon_url: string | null // ✅ DODANE
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
// UTILITY - Test połączenia
// =====================================================

import { supabase } from '../client'

export async function testSupabaseConnection() {
  const { data, error } = await supabase.from('mythologies').select('*')

  if (error) {
    console.error('Supabase connection error:', error)
    return null
  }

  console.log('✅ Supabase connected! Mythologies:', data)
  return data
}
