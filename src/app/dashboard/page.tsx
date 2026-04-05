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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Phone, Stethoscope, HeartPulse } from 'lucide-react'

type Patient = {
  name: string
  age: number
  diagnosis: string
  photo_url: string | null
  primary_doctor: string
  emergency_contact: string
}

type FamilyMember = {
  id: number
  name: string
  role: string
  relationship: string
  avatar_url: string | null
  phone: string | null
}

type Task = {
  id: number; title: string; description: string; status: string
  due_date: string; assigned_to_id: number; family_members: { name: string }
}
type ActivityType = {
  id: number; action_type: string; description: string
  created_at: string; family_members: { name: string }
}

function PatientCard({ patient }: { patient: Patient }) {
  if (!patient) return null;
  
  return (
    <Card className="shadow-sm border-rose-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-zinc-900 flex items-center gap-2">
          {patient.name}
        </CardTitle>
        <CardDescription className="text-lg">
          {patient.age} years old
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-50 rounded-md">
              <HeartPulse className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Diagnosis</p>
              <p className="text-sm text-zinc-900 font-medium">{patient.diagnosis}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-md">
              <Stethoscope className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Primary Doctor</p>
              <p className="text-sm text-zinc-900 font-medium">{patient.primary_doctor}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-md">
              <Phone className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Emergency Contact</p>
              <p className="text-sm text-zinc-900 font-medium">{patient.emergency_contact}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FamilyAvatars({ members }: { members: FamilyMember[] }) {
  if (!members || members.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-zinc-900">Care Team</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {members.map(member => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
                <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium">
                  {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900 truncate">{member.name}</p>
                  <Badge variant="secondary" className="text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 border-none px-1.5 py-0">
                    {member.role}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">{member.relationship}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeMedCount, setActiveMedCount] = useState(0)
  const [activity, setActivity] = useState<ActivityType[]>([])

  // Redirect to user selection if not logged in
  useEffect(() => {
    if (!user) {
      router.replace('/')
    }
  }, [user, router])

  useEffect(() => {
    fetch('/api/family')
      .then(r => r.json())
      .then(data => {
        if (data.patient) setPatient(data.patient)
        if (data.members) setMembers(data.members)
        if (data.tasks) setTasks(data.tasks)
        if (data.activeMedCount !== undefined) setActiveMedCount(data.activeMedCount)
      })
      .catch(err => console.error("Error fetching family info:", err))
      
    fetch('/api/activity')
      .then(r => r.json())
      .then(data => { 
        if (Array.isArray(data)) setActivity(data) 
      })
      .catch(err => console.error("Error fetching activity:", err))
  }, [])

  if (!user) return null; // Avoid rendering until redirect happens if no user

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          {patient && <PatientCard patient={patient} />}
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Tasks & Activity</CardTitle>
              <CardDescription>To be implemented</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-50 p-4 rounded overflow-auto border">
                {JSON.stringify({ tasks, activity }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 space-y-6">
          <FamilyAvatars members={members} />
          
          <Card className="shadow-sm border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-blue-900">Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {activeMedCount}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-blue-900">Active Prescriptions</p>
                  <p className="text-xs text-blue-700/80">Track doses on medications page</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
