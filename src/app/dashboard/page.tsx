// DASHBOARD — matches App Builder layout
// Fetches: GET /api/family → { patient, members, activeMedCount }
// Fetches: GET /api/tasks → all tasks with full CRUD
// Fetches: GET /api/activity → recent activity log entries

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MoreVertical, Plus, Pencil, Trash2,
  CheckCircle2, Circle, Clock, Pill, QrCode
} from 'lucide-react'
import QRCode from 'qrcode'

type Patient = {
  name: string; age: number; diagnosis: string
  photo_url: string | null; primary_doctor: string; emergency_contact: string
}
type FamilyMember = {
  id: number; name: string; role: string; relationship: string
  avatar_url: string | null; phone: string | null
}
type Task = {
  id: number; title: string; description: string; status: string
  due_date: string; assigned_to_id: number; family_members: { name: string }
}
type ActivityEntry = {
  id: number; action_type: string; description: string
  created_at: string; family_members: { name: string }
}

/* ─── Helpers ─── */
const MEMBER_COLORS = [
  { bg: 'bg-[#f43f5e]', text: 'text-white' },
  { bg: 'bg-[#0ea5e9]', text: 'text-white' },
  { bg: 'bg-[#10b981]', text: 'text-white' },
  { bg: 'bg-[#8b5cf6]', text: 'text-white' },
  { bg: 'bg-[#f59e0b]', text: 'text-white' },
  { bg: 'bg-[#14b8a6]', text: 'text-white' },
]

function memberColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length]
}

function dueDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ─── Patient Information Card ─── */
function PatientInfoCard({ patient }: { patient: Patient }) {
  // Split diagnosis into conditions for badge display
  const conditions = patient.diagnosis
    ? patient.diagnosis.split(/[,;]/).map(c => c.trim()).filter(Boolean)
    : []

  return (
    <Card data-tour="patient-card" className="rounded-2xl border-[#f43f5e]/10 shadow-sm shadow-[#f43f5e]/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Patient Information</span>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <MoreVertical size={18} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-[#0f172a] mb-1">
              {patient.name}
            </h3>
            <p className="text-[#64748b]">Age {patient.age}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#dbeafe] rounded-xl">
            <span className="text-2xl">🇻🇳</span>
            <span className="font-medium text-[#0f172a]">Vietnamese</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-[#64748b] mb-2">Conditions</p>
          <div className="flex flex-wrap gap-2">
            {conditions.length > 0 ? (
              conditions.map((condition, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-[#fef3c7] text-[#92400e] border-0 rounded-lg px-3 py-1"
                >
                  {condition}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="bg-[#fef3c7] text-[#92400e] border-0 rounded-lg px-3 py-1">
                {patient.diagnosis}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Family Care Team (horizontal avatars) ─── */
function FamilyCareTeam({ members }: { members: FamilyMember[] }) {
  return (
    <Card data-tour="care-team" className="rounded-2xl border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Family Care Team</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-wrap">
          {members.map((m) => {
            const c = memberColor(m.name)
            return (
              <div key={m.id} className="flex flex-col items-center gap-2">
                <Avatar className="size-12 border-2 border-white shadow-sm">
                  <AvatarImage src={m.avatar_url || undefined} alt={m.name} />
                  <AvatarFallback className={`${c.bg} ${c.text} font-semibold`}>
                    {m.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-[#64748b]">{m.name.split(' ')[0]}</span>
              </div>
            )
          })}
          <button className="flex flex-col items-center gap-2 group">
            <div className="size-12 rounded-full border-2 border-dashed border-[#cbd5e1] group-hover:border-[#f43f5e] flex items-center justify-center transition-colors">
              <Plus size={20} className="text-[#64748b] group-hover:text-[#f43f5e]" />
            </div>
            <span className="text-sm text-[#64748b]">Add</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Task List (full CRUD with checkbox cards) ─── */
function TaskList({
  tasks, members, userId, onMutate,
}: {
  tasks: Task[]; members: FamilyMember[]; userId: number; onMutate: () => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', assigned_to_id: '', due_date: '' })

  function openAdd() {
    setEditing(null)
    setForm({ title: '', description: '', assigned_to_id: String(members[0]?.id ?? ''), due_date: '' })
    setDialogOpen(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description ?? '',
      assigned_to_id: String(task.assigned_to_id),
      due_date: task.due_date,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.due_date) return
    setSaving(true)
    try {
      if (editing) {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editing.id, family_member_id: userId,
            title: form.title, description: form.description,
            assigned_to_id: Number(form.assigned_to_id), due_date: form.due_date,
          }),
        })
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            family_member_id: userId,
            title: form.title, description: form.description,
            assigned_to_id: Number(form.assigned_to_id), due_date: form.due_date,
          }),
        })
      }
      setDialogOpen(false)
      onMutate()
    } finally { setSaving(false) }
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status: newStatus, family_member_id: userId }),
    })
    onMutate()
  }

  function confirmDelete(task: Task) {
    setDeletingTask(task)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!deletingTask) return
    await fetch(`/api/tasks?id=${deletingTask.id}&family_member_id=${userId}`, { method: 'DELETE' })
    setDeleteDialogOpen(false)
    setDeletingTask(null)
    onMutate()
  }

  const pending = tasks.filter(t => t.status !== 'completed')
  const completed = tasks.filter(t => t.status === 'completed')

  return (
    <>
      <Card data-tour="task-list" className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks</span>
            <Button data-tour="add-task" size="sm" onClick={openAdd} className="rounded-xl bg-[#f43f5e] hover:bg-[#f43f5e]/90">
              <Plus size={18} />
              Add Task
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 && (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                <Circle className="w-6 h-6 text-rose-200" />
              </div>
              <p className="text-sm font-medium text-[#64748b]">No tasks yet</p>
              <p className="text-xs text-[#94a3b8] mt-1 max-w-[200px] mx-auto">Add a task to coordinate care with the family</p>
            </div>
          )}

          {pending.map((task) => {
            const isCompleted = false
            const assigneeName = task.family_members?.name ?? ''
            const c = memberColor(assigneeName)
            return (
              <Card key={task.id} className={`rounded-xl border transition-all ${isCompleted ? 'bg-[#f1f5f9] border-gray-200' : 'border-gray-200 hover:shadow-md'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(task)}
                      className="mt-1 shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Circle className="w-[18px] h-[18px] text-[#cbd5e1] hover:text-[#f43f5e] transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0f172a]">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-[#94a3b8] mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className={`${c.bg} ${c.text} text-xs`}>
                              {assigneeName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#64748b]">{assigneeName.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[#64748b]">
                          <Clock size={14} />
                          {dueDateLabel(task.due_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(task)}>
                        <Pencil className="w-3.5 h-3.5 text-[#94a3b8]" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => confirmDelete(task)}>
                        <Trash2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {completed.map((task) => {
            const assigneeName = task.family_members?.name ?? ''
            const c = memberColor(assigneeName)
            return (
              <Card key={task.id} className="rounded-xl bg-[#f1f5f9] border-gray-200 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(task)}
                      className="mt-1 shrink-0 cursor-pointer transition-transform hover:scale-110"
                    >
                      <CheckCircle2 className="w-[18px] h-[18px] text-[#10b981]" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-through text-[#64748b]">{task.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className={`${c.bg} ${c.text} text-xs`}>
                              {assigneeName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#64748b]">{assigneeName.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[#64748b]">
                          <Clock size={14} />
                          {dueDateLabel(task.due_date)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => confirmDelete(task)}>
                      <Trash2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      {/* Add / Edit Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Task' : 'New Task'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the task details below.' : 'Create a new task for the care team.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title" placeholder="e.g. Pick up prescription refill"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description <span className="text-[#94a3b8] font-normal">(optional)</span></Label>
              <Textarea
                id="task-desc" placeholder="Add any extra details..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Assign to</Label>
                <Select value={form.assigned_to_id} onValueChange={v => setForm(f => ({ ...f, assigned_to_id: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due" type="date"
                  value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.due_date}
              className="bg-[#f43f5e] hover:bg-[#f43f5e]/90 text-white"
            >
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingTask?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── Medication Count Card ─── */
function MedCountCard({ count }: { count: number }) {
  return (
    <Card data-tour="med-count" className="rounded-2xl border-[#0ea5e9]/10 shadow-sm shadow-[#0ea5e9]/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center">
            <Pill className="text-[#0ea5e9]" size={28} />
          </div>
          <div>
            <p className="text-3xl font-semibold text-[#0f172a]">{count}</p>
            <p className="text-sm text-[#64748b]">Active Medications</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Activity Feed (timeline) ─── */
function ActivityFeed({ activity }: { activity: ActivityEntry[] }) {
  function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay === 1) return 'Yesterday'
    if (diffDay < 7) return `${diffDay}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function dotColor(name: string) {
    const c = memberColor(name)
    return c.bg
  }

  return (
    <Card data-tour="activity-feed" className="rounded-2xl border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 && (
          <div className="text-center py-6">
            <Clock className="w-5 h-5 text-[#cbd5e1] mx-auto mb-2" />
            <p className="text-xs text-[#94a3b8]">Activity will appear here</p>
          </div>
        )}
        <div className="relative">
          {/* Timeline line */}
          {activity.length > 1 && (
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
          )}

          <div className="space-y-6">
            {activity.map((a) => {
              const name = a.family_members?.name ?? ''
              return (
                <div key={a.id} className="relative flex gap-4">
                  <div className={`size-4 rounded-full ${dotColor(name)} border-2 border-white z-10 flex-shrink-0`} />
                  <div className="flex-1 -mt-1">
                    <p className="text-sm text-[#0f172a]">
                      <span className="font-medium">{name.split(' ')[0]}</span>{' '}
                      {a.description.charAt(0).toLowerCase() + a.description.slice(1)}
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">{formatTime(a.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeMedCount, setActiveMedCount] = useState(0)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [qrOpen, setQrOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  async function openQrDialog() {
    const url = `${window.location.origin}/emergency/ba-lan`
    const dataUrl = await QRCode.toDataURL(url, { width: 280, margin: 2 })
    setQrDataUrl(dataUrl)
    setQrOpen(true)
  }

  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])

  const fetchAll = useCallback(() => {
    fetch('/api/family')
      .then(r => r.json())
      .then(data => {
        if (data.patient) setPatient(data.patient)
        if (data.members) setMembers(data.members)
        if (data.activeMedCount !== undefined) setActiveMedCount(data.activeMedCount)
      })
      .catch(err => console.error('Error fetching family:', err))

    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTasks(data) })
      .catch(err => console.error('Error fetching tasks:', err))

    fetch('/api/activity')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActivity(data) })
      .catch(err => console.error('Error fetching activity:', err))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto pb-20 lg:pb-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient info card */}
          {patient && <PatientInfoCard patient={patient} />}

          {/* Family care team */}
          <FamilyCareTeam members={members} />

          {/* Task list */}
          <TaskList
            tasks={tasks}
            members={members}
            userId={user.id}
            onMutate={fetchAll}
          />
        </div>

        {/* Right column — sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Medication count */}
          <MedCountCard count={activeMedCount} />

          {/* Activity feed */}
          <ActivityFeed activity={activity} />

          {/* Emergency card button */}
          <Button
            data-tour="emergency-qr"
            variant="outline"
            onClick={openQrDialog}
            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Emergency QR Card
          </Button>
        </div>
      </div>

      {/* Emergency QR Card Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-xs text-center rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Emergency QR Card</DialogTitle>
            <DialogDescription>
              Scan this code to view {patient?.name ?? "the patient"}&apos;s emergency medical info.
            </DialogDescription>
          </DialogHeader>
          {qrDataUrl && (
            <div className="flex flex-col items-center gap-4 py-2">
              <img src={qrDataUrl} alt="Emergency QR Code" className="w-56 h-56 rounded-lg border border-zinc-200" />
              <a
                href="/emergency/ba-lan"
                target="_blank"
                className="text-sm text-[#f43f5e] font-medium hover:underline"
              >
                Open emergency card &rarr;
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
