// MEDICATIONS CRUD
// GET    /api/medications                — All medications for patient, sorted active-first
// POST   /api/medications                — Create new medication (+ activity log)
// PATCH  /api/medications                — Update any field including active toggle (+ activity log)
// DELETE /api/medications?id=N&family_member_id=N — Remove medication (+ activity log)

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', 1)
    .order('active', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const { name, dosage, frequency, purpose, administered_by, start_date, family_member_id } = await req.json()

  if (!name || !dosage || !frequency || !purpose || !administered_by || !start_date) {
    return Response.json({ error: 'name, dosage, frequency, purpose, administered_by, and start_date are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('medications')
    .insert({ patient_id: 1, name, dosage, frequency, purpose, administered_by, start_date, active: true })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (family_member_id) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id,
      action_type: 'medication_added',
      description: `Added medication "${name}"`,
    })
    if (activityError) console.error('Activity log failed:', activityError.message)
  }

  return Response.json(data)
}

const ALLOWED_MED_FIELDS = ['name', 'dosage', 'frequency', 'purpose', 'administered_by', 'start_date', 'active'] as const

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, family_member_id } = body

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const fields: Record<string, unknown> = {}
  for (const key of ALLOWED_MED_FIELDS) {
    if (key in body) fields[key] = body[key]
  }

  const { data, error } = await supabase
    .from('medications')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (family_member_id) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id,
      action_type: 'medication_updated',
      description: `Updated medication "${data.name}"`,
    })
    if (activityError) console.error('Activity log failed:', activityError.message)
  }

  return Response.json(data)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const family_member_id = req.nextUrl.searchParams.get('family_member_id')

  if (!id) {
    return Response.json({ error: 'id query param is required' }, { status: 400 })
  }

  const { data: med } = await supabase
    .from('medications')
    .select('name')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('medications').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (family_member_id && med) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id: Number(family_member_id),
      action_type: 'medication_deleted',
      description: `Removed medication "${med.name}"`,
    })
    if (activityError) console.error('Activity log failed:', activityError.message)
  }

  return Response.json({ success: true })
}
