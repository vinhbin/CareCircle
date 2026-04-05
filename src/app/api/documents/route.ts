// MEDICAL BINDER — Document upload + AI classification
// GET  /api/documents — All documents with uploader joined, newest first
// POST /api/documents — Upload to storage, classify with Gemini, save + activity log

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { classifyDocument } from '@/lib/gemini'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'application/pdf',
]

export async function GET() {
  const { data, error } = await supabase
    .from('documents')
    .select('*, uploader:family_members(id, name, avatar_url)')
    .eq('patient_id', 1)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return rateLimitResponse()

  const { file, fileName, mimeType, family_member_id } = await req.json()

  if (!file || !fileName || !mimeType) {
    return Response.json({ error: 'file (base64), fileName, and mimeType are required' }, { status: 400 })
  }

  if (file.length > 13_000_000) {
    return Response.json({ error: 'File too large — max 10 MB' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  // Upload to Supabase Storage
  const ext = fileName.split('.').pop() || 'bin'
  const storagePath = `patient-1/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const buffer = Buffer.from(file, 'base64')
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, { contentType: mimeType, upsert: false })

  if (uploadError) {
    console.error('Storage upload failed:', uploadError.message)
    return Response.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  // Classify with Gemini (graceful fallback)
  let category = 'Other'
  let description = fileName
  try {
    const result = await classifyDocument(file, mimeType)
    category = result.category
    description = result.description
  } catch (err) {
    console.error('Gemini classification failed:', err instanceof Error ? err.message : 'Unknown error')
  }

  // Insert document record
  const { data, error: insertError } = await supabase
    .from('documents')
    .insert({
      patient_id: 1,
      file_name: fileName,
      storage_path: storagePath,
      mime_type: mimeType,
      category,
      ai_description: description,
      uploaded_by: family_member_id || null,
    })
    .select('*, uploader:family_members(id, name, avatar_url)')
    .single()

  if (insertError) {
    console.error('Document insert failed:', insertError.message)
    // Clean up uploaded file
    await supabase.storage.from('documents').remove([storagePath])
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  // Activity log
  if (family_member_id) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id,
      action_type: 'document_uploaded',
      description: `Uploaded ${category.toLowerCase()}: ${description}`,
    })
    if (activityError) console.error('Activity log failed:', activityError.message)
  }

  return Response.json(data)
}
