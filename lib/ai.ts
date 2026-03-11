import Anthropic from '@anthropic-ai/sdk'

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

const MODEL = 'claude-sonnet-4-6'

export async function generateTimeEntryDescription(context: {
  clientName: string | null
  projectName: string | null
  type: string
  existingDescription?: string
  recentDescriptions?: string[]
}): Promise<string> {
  const client = getClient()

  const prompt = `Je bent een assistent voor een Nederlandse ZZP'er die urenstaten bijhoudt.
Genereer een korte, professionele omschrijving voor een tijdregistratie (max 60 tekens).

Context:
- Type: ${context.type}
- Klant: ${context.clientName ?? 'geen'}
- Project: ${context.projectName ?? 'geen'}
${context.existingDescription ? `- Huidige omschrijving: ${context.existingDescription}` : ''}
${context.recentDescriptions?.length ? `- Recente omschrijvingen: ${context.recentDescriptions.slice(0, 3).join(', ')}` : ''}

Geef ALLEEN de omschrijving terug, geen uitleg. Kort en zakelijk. In het Nederlands.`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : ''
  return text
}

export async function generateDailyBriefing(context: {
  userName: string
  todayEvents: { title: string; startAt: string; clientName?: string }[]
  pendingTasks: { title: string; dueAt?: string }[]
  weekHours: number
  weekGoal: number
  unconfirmedCount: number
}): Promise<string> {
  const client = getClient()

  const eventsList = context.todayEvents.length > 0
    ? context.todayEvents
        .map((e) => `- ${new Date(e.startAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}: ${e.title}${e.clientName ? ` (${e.clientName})` : ''}`)
        .join('\n')
    : '- Geen afspraken vandaag'

  const tasksList = context.pendingTasks.length > 0
    ? context.pendingTasks.slice(0, 3).map((t) => `- ${t.title}`).join('\n')
    : '- Geen openstaande taken'

  const prompt = `Je bent een persoonlijke assistent voor ${context.userName}, een Nederlandse ZZP'er.
Schrijf een korte, motiverende dagstart-briefing (max 3 zinnen). Wees concreet en to-the-point. In het Nederlands.

Situatie:
- Uren deze week: ${context.weekHours} van ${context.weekGoal} uur doel
- Onbevestigde agenda-events: ${context.unconfirmedCount}
- Afspraken vandaag:\n${eventsList}
- Openstaande taken:\n${tasksList}

Geef ALLEEN de briefing tekst, geen opmaak of titels.`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : ''
  return text
}
