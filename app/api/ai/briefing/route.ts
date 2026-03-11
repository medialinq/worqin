import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDailyBriefing } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const briefing = await generateDailyBriefing(body)
    return NextResponse.json({ briefing })
  } catch (error) {
    console.error('[AI Briefing Error]', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
