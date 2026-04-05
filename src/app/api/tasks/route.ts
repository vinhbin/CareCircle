// TASKS CRUD
// GET    /api/tasks                              — All tasks with assignee name, sorted by due date
// POST   /api/tasks                              — Create task (+ activity log)
// PATCH  /api/tasks                              — Update any field: title, description, assigned_to_id, due_date, status (+ activity log)
// DELETE /api/tasks?id=N&family_member_id=N      — Remove task (+ activity log)

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, family_members(name)')
    .eq('patient_id', 1)
    .order('due_date', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const { title, description, assigned_to_id, due_date, family_member_id } = await req.json()

  if (!title || !assigned_to_id || !due_date) {
    return Response.json({ error: 'title, assigned_to_id, and due_date are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ patient_id: 1, title, description, assigned_to_id, due_date })
    .select('*, family_members(name)')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Log activity
  if (family_member_id) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id,
      action_type: 'task_created',
      description: `Added task "${title}"`,
    })
    if (activityError) console.error('Activity log failed:', activityError.message)
  }

  return Response.json(data)
}

const ALLOWED_TASK_FIELDS = ['title', 'description', 'assigned_to_id', 'due_date', 'status'] as const

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, family_member_id } = body

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const fields: Record<string, unknown> = {}
  for (const key of ALLOWED_TASK_FIELDS) {
    if (key in body) fields[key] = body[key]
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(fields)
    .eq('id', id)
    .select('*, family_members(name)')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Log status changes to activity
  if (family_member_id && fields.status) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id,
      action_type: fields.status === 'completed' ? 'task_completed' : 'task_updated',
      description: fields.status === 'completed'
        ? `Marked "${data.title}" as completed`
        : `Updated task "${data.title}"`,
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

  // Get task title before deleting for the activity log
  const { data: task } = await supabase
    .from('tasks')
    .select('title')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (family_member_id && task) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      patient_id: 1,
      family_member_id: Number(family_member_id),
      action_type: 'task_deleted',
      description: `Removed task "${task.title}"`,
    })
    if (activityError) console.error('Activity log failed:', activityError.message)
  }

  return Response.json({ success: true })
}
