// DOCUMENT DETAIL — signed URL + delete
// GET    /api/documents/[id] — Generate signed URL (1hr) for viewing
// DELETE /api/documents/[id] — Remove from storage + DB + activity log

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: doc, error } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (error || !doc) return Response.json({ error: 'Document not found' }, { status: 404 })

  const { data: signed, error: signError } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.storage_path, 3600)

  if (signError || !signed) return Response.json({ error: 'Failed to generate URL' }, { status: 500 })

  return Response.json({ signedUrl: signed.signedUrl })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path, file_name, category, ai_description, uploaded_by')
    .eq('id', id)
    .single()

  if (fetchError || !doc) return Response.json({ error: 'Document not found' }, { status: 404 })

  // Remove from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([doc.storage_path])

  if (storageError) console.error('Storage delete failed:', storageError.message)

  // Remove from DB
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 })

  // Activity log
  if (doc.uploaded_by) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id: doc.uploaded_by,
      action_type: 'document_deleted',
      description: `Removed ${doc.category?.toLowerCase() || 'document'}: ${doc.ai_description || doc.file_name}`,
    })
    if (activityError) console.error('Activity log failed:', activityError.message)
  }

  return Response.json({ success: true })
}
