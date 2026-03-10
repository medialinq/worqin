import { createClient } from '@/lib/supabase/server'

const BUCKET = 'receipts'

/**
 * Upload a receipt file to Supabase Storage.
 * Returns the storage path (not a URL).
 */
export async function uploadReceipt(
  organizationId: string,
  expenseId: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const supabase = await createClient()

  // Sanitize filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${organizationId}/${expenseId}/${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('[Storage Error]', error.message)
    return { error: 'Failed to upload receipt' }
  }

  return { path }
}

/**
 * Get a signed URL for a receipt file (1 hour expiry).
 */
export async function getReceiptUrl(path: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600) // 1 hour

  if (error || !data) return null
  return data.signedUrl
}

/**
 * Delete a receipt file from storage.
 */
export async function deleteReceipt(path: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  if (error) {
    console.error('[Storage Error]', error.message)
    return false
  }

  return true
}
