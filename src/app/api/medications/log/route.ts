// MEDICATION DOSE TRACKING
// GET  /api/medications/log?date=YYYY-MM-DD — All dose logs for a day with who + med name
// POST /api/medications/log                 — Confirm a dose was given (+ activity log), returns today's count

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('medication_logs')
    .select('*, family_members(name), medications(name, frequency)')
    .gte('logged_at', `${date}T00:00:00`)
    .lte('logged_at', `${date}T23:59:59`)
    .order('logged_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const { medication_id, family_member_id, date: clientDate } = await req.json()

  if (!medication_id || !family_member_id) {
    return Response.json({ error: 'medication_id and family_member_id are required' }, { status: 400 })
  }

  // Insert medication log
  const { data: log, error: logError } = await supabase
    .from('medication_logs')
    .insert({ medication_id, family_member_id })
    .select('*, family_members(name), medications(name)')
    .single()

  if (logError) return Response.json({ error: logError.message }, { status: 500 })

  // Log to activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    patient_id: 1,
    family_member_id,
    action_type: 'medication_confirmed',
    description: `Confirmed ${log.medications.name} was given`,
  })
  if (activityError) console.error('Activity log failed:', activityError.message)

  // Return today's count for this medication (use client date to avoid UTC timezone mismatch)
  const today = clientDate ?? new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('medication_logs')
    .select('*', { count: 'exact', head: true })
    .eq('medication_id', medication_id)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)

  return Response.json({ log, todayCount: count })
}
