// PERSON A — Dashboard (moved from / to /dashboard in V2)
// Fetches: GET /api/family → { patient, members, tasks, activeMedCount }
// Fetches: GET /api/activity → recent activity log entries
//
// Components to build:
//   PatientCard     — name, age, diagnosis, primary_doctor, emergency_contact
//   FamilyAvatars   — Avatar row with name + role badge per member
//   TaskList        — full CRUD: add, edit, toggle complete, delete tasks (via dialogs)
//   MedCountBadge   — "4 active medications"
//   ActivityFeed    — recent actions: "Kevin confirmed Metformin at 8:32 AM"
//
// User context: useUser() provides the current family member for all mutating API calls

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'

type FamilyMember = { id: number; name: string; role: string; relationship: string }
type Task = {
  id: number; title: string; description: string; status: string
  due_date: string; assigned_to_id: number; family_members: { name: string }
}
type Activity = {
  id: number; action_type: string; description: string
  created_at: string; family_members: { name: string }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [patient, setPatient] = useState<Record<string, string> | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeMedCount, setActiveMedCount] = useState(0)
  const [activity, setActivity] = useState<Activity[]>([])

  // Redirect to user selection if not logged in
  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])

  useEffect(() => {
    fetch('/api/family')
      .then(r => r.json())
      .then(data => {
        setPatient(data.patient)
        setMembers(data.members ?? [])
        setTasks(data.tasks ?? [])
        setActiveMedCount(data.activeMedCount ?? 0)
      })
    fetch('/api/activity')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActivity(data) })
  }, [])

  return (
    <div>
      <h1>Dashboard — build me (Person A)</h1>
      <p className="text-sm text-zinc-500 mb-4">Data below confirms APIs are wired up. Replace this with PatientCard, FamilyAvatars, TaskList, MedCountBadge, and ActivityFeed components.</p>
      <pre className="text-xs bg-white p-4 rounded border overflow-auto">{JSON.stringify({ patient, members, tasks, activeMedCount, activity }, null, 2)}</pre>
    </div>
  )
}
