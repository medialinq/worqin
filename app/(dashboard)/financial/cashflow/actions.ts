'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import { updateCashflowSettingsSchema } from '@/lib/validations'

// ── Types ────────────────────────────────────────────

type CashflowSettings = {
  id: string
  organization_id: string
  monthly_fixed_expenses: number
  tax_reserve_percentage: number
  current_balance: number
  safety_buffer: number
  vat_frequency: string
  updated_at: string
}

// ── Upsert Cashflow Settings ─────────────────────────

export async function updateCashflowSettings(
  raw: unknown
): Promise<ActionResult<CashflowSettings>> {
  const parsed = updateCashflowSettingsSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('cashflow_settings')
    .upsert(
      {
        organization_id: organizationId,
        monthly_fixed_expenses: parsed.data.monthlyFixedExpenses,
        tax_reserve_percentage: parsed.data.taxReservePercentage,
        current_balance: parsed.data.currentBalance,
        safety_buffer: parsed.data.safetyBuffer,
        vat_frequency: parsed.data.vatFrequency ?? 'QUARTERLY',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id' }
    )
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/financial/cashflow')
  return ok(data as CashflowSettings)
}
