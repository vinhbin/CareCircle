// FAMILY MEMBERS
// POST /api/family/members — Add a new family member to the care circle

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { name, relationship, role } = await req.json()

  if (!name || !relationship || !role) {
    return Response.json({ error: 'name, relationship, and role are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('family_members')
    .insert({ patient_id: 1, name, relationship, role })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
