// ACTIVITY LOG
// GET  /api/activity — Latest 20 activity entries with family member name joined
// POST /api/activity — Log an action: { family_member_id, action_type, description }

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, family_members(name)')
    .eq('patient_id', 1)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const { family_member_id, action_type, description } = await req.json()

  if (!family_member_id || !action_type || !description) {
    return Response.json({ error: 'family_member_id, action_type, and description are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('activity_log')
    .insert({ patient_id: 1, family_member_id, action_type, description })
    .select('*, family_members(name)')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
