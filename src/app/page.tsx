import { getMythologies } from '@lib/supabase/queries/mythologies'
import LandingLayout from '@/components/LandingLayout'
import React from 'react'

export const revalidate = 3600 // Cache na 1h

export default async function Home() {
  const mythologies = await getMythologies().catch(() => [])

  return <LandingLayout mythologies={mythologies} />
}
