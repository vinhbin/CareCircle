// DOCTOR NOTES
// GET  /api/notes — All notes with ai_translations joined, newest first
// POST /api/notes — Create new note (manual entry or after photo scan) (+ activity log)

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('doctor_notes')
    .select('*, ai_translations(*)')
    .eq('patient_id', 1)
    .order('visit_date', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const { doctor_name, specialty, visit_date, raw_notes, family_member_id } = await req.json()

  if (!doctor_name || !specialty || !visit_date || !raw_notes) {
    return Response.json({ error: 'doctor_name, specialty, visit_date, and raw_notes are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('doctor_notes')
    .insert({ patient_id: 1, doctor_name, specialty, visit_date, raw_notes })
    .select('*, ai_translations(*)')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (family_member_id) {
    await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id,
      action_type: 'note_added',
      description: `Added doctor note from ${doctor_name}`,
    })
  }

  return Response.json(data)
}
