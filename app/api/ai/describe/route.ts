import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTimeEntryDescription } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const description = await generateTimeEntryDescription(body)
    return NextResponse.json({ description })
  } catch (error) {
    console.error('[AI Describe Error]', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
