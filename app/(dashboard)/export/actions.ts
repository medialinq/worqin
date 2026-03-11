'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import { z } from 'zod'

const markExportedSchema = z.object({
  timeEntryIds: z.array(z.string().uuid()).optional(),
  expenseIds: z.array(z.string().uuid()).optional(),
})

export async function markAsExported(raw: unknown): Promise<ActionResult<{ count: number }>> {
  const parsed = markExportedSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()
  const { timeEntryIds = [], expenseIds = [] } = parsed.data
  const exportedAt = new Date().toISOString()
  let count = 0

  if (timeEntryIds.length > 0) {
    const { error } = await supabase
      .from('time_entries')
      .update({ exported_at: exportedAt })
      .in('id', timeEntryIds)
      .eq('organization_id', organizationId)
    if (error) return dbErr(error)
    count += timeEntryIds.length
  }

  if (expenseIds.length > 0) {
    const { error } = await supabase
      .from('expenses')
      .update({ exported_at: exportedAt })
      .in('id', expenseIds)
      .eq('organization_id', organizationId)
    if (error) return dbErr(error)
    count += expenseIds.length
  }

  revalidatePath('/export')
  return ok({ count })
}
