import { NextResponse } from 'next/server'
import { getMythologies } from '@lib/supabase/queries/mythologies'

export const dynamic = 'force-dynamic' // Zawsze świeże dane

export async function GET() {
  try {
    const mythologies = await getMythologies()
    return NextResponse.json(mythologies)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mythologies' },
      { status: 500 }
    )
  }
}
