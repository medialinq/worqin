export type DBAScore = 'GOOD' | 'MEDIUM' | 'LOW'

export interface DBACheckInput {
  timeEntries: {
    client_id: string | null
    type: string
    is_indirect: boolean
    duration_mins: number | null
    duration_billed_mins: number | null
    started_at: string
  }[]
  clients: {
    id: string
    name: string
    color: string
    is_active: boolean
  }[]
  /** Number of days to look back (default: 90) */
  periodDays?: number
}

export interface ClientBreakdown {
  clientId: string
  clientName: string
  clientColor: string
  percentage: number
  hours: number
}

export interface DBACheckResult {
  score: DBAScore
  largestClientPercentage: number
  activeClientCount: number
  hasIndirectHours: boolean
  totalHours: number
  clientBreakdown: ClientBreakdown[]
  warnings: string[]
  periodDays: number
}

export function calculateDBAScore(input: DBACheckInput): DBACheckResult {
  const periodDays = input.periodDays ?? 90
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays)

  const filtered = input.timeEntries.filter(
    (e) => new Date(e.started_at) >= cutoff
  )

  // Aggregate hours per client
  const clientHours: Record<string, number> = {}
  let totalMins = 0
  let hasIndirect = false

  for (const entry of filtered) {
    const mins = entry.duration_billed_mins ?? entry.duration_mins ?? 0
    if (mins <= 0) continue
    totalMins += mins
    if (entry.is_indirect) hasIndirect = true

    const cid = entry.client_id ?? '__no_client__'
    clientHours[cid] = (clientHours[cid] ?? 0) + mins
  }

  const totalHours = Math.round((totalMins / 60) * 10) / 10

  // Build breakdown
  const clientMap = new Map(input.clients.map((c) => [c.id, c]))
  const breakdown: ClientBreakdown[] = Object.entries(clientHours)
    .map(([clientId, mins]) => {
      const client = clientMap.get(clientId)
      return {
        clientId,
        clientName: client?.name ?? 'Onbekend',
        clientColor: client?.color ?? '#94A3B8',
        hours: Math.round((mins / 60) * 10) / 10,
        percentage: totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  const largestPct = breakdown[0]?.percentage ?? 0
  const activeClientIds = new Set(
    filtered.filter((e) => e.client_id).map((e) => e.client_id!)
  )

  // Determine score based on DBA rules:
  // GOOD:   largest client < 50% AND >= 3 active clients
  // MEDIUM: largest client 50-70% OR < 3 active clients
  // LOW:    largest client > 70% OR only 1 client
  let score: DBAScore = 'GOOD'
  if (largestPct > 70 || activeClientIds.size <= 1) {
    score = 'LOW'
  } else if (largestPct > 50 || activeClientIds.size < 3) {
    score = 'MEDIUM'
  }

  // Warnings
  const warnings: string[] = []
  if (largestPct > 50) {
    warnings.push('Meer dan 50% van je uren gaat naar één opdrachtgever')
  }
  if (activeClientIds.size < 2) {
    warnings.push('Je hebt minder dan 2 actieve opdrachtgevers')
  }
  if (!hasIndirect) {
    warnings.push(
      'Je registreert geen indirecte uren (administratie, acquisitie, etc.)'
    )
  }

  return {
    score,
    largestClientPercentage: largestPct,
    activeClientCount: activeClientIds.size,
    hasIndirectHours: hasIndirect,
    totalHours,
    clientBreakdown: breakdown,
    warnings,
    periodDays,
  }
}
