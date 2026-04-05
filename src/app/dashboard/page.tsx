// PERSON A — Dashboard (moved from / to /dashboard in V2)
// Fetches: GET /api/family → { patient, members, tasks, activeMedCount }
// Fetches: GET /api/tasks → all tasks with full CRUD
// Fetches: GET /api/activity → recent activity log entries

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Phone, Stethoscope, HeartPulse, Plus, Pencil, Trash2,
  CheckCircle2, Circle, Clock, CalendarDays, Pill
} from 'lucide-react'

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
function nameToColor(name: string) {
  const palettes = [
    { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200' },
    { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200' },
    { bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-200' },
    { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-200' },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palettes[Math.abs(hash) % palettes.length]
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ─── PatientCard ─── */
function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Card className="shadow-md shadow-rose-100/50 border-rose-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="h-1.5 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300" />
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-zinc-900 tracking-tight">{patient.name}</CardTitle>
        <CardDescription className="text-base text-zinc-500">{patient.age} years old</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
          {[
            { icon: HeartPulse, label: 'Diagnosis', value: patient.diagnosis, iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
            { icon: Stethoscope, label: 'Primary Doctor', value: patient.primary_doctor, iconBg: 'bg-sky-50', iconColor: 'text-sky-500' },
            { icon: Phone, label: 'Emergency Contact', value: patient.emergency_contact, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
          ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
            <div key={label} className="flex items-center gap-3 group/row rounded-lg p-2 sm:p-3 sm:bg-zinc-50/50 transition-colors sm:hover:bg-zinc-50">
              <div className={`p-2 ${iconBg} rounded-lg shrink-0 transition-transform group-hover/row:scale-105`}>
                <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm text-zinc-800 font-medium truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── FamilyAvatars ─── */
function FamilyAvatars({ members }: { members: FamilyMember[] }) {
  if (!members.length) return null
  return (
    <Card className="shadow-md shadow-zinc-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-backwards">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-zinc-800 flex items-center gap-2">
          Care Team
          <span className="text-xs font-normal text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">{members.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {members.map((m, i) => {
            const c = nameToColor(m.name)
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 group/member animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-backwards"
                style={{ animationDelay: `${150 + i * 80}ms` }}
              >
                <Avatar className={`ring-2 ${c.ring} transition-transform group-hover/member:scale-110`}>
                  <AvatarImage src={m.avatar_url || undefined} alt={m.name} />
                  <AvatarFallback className={`${c.bg} ${c.text} font-semibold text-sm`}>
                    {m.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-800 truncate">{m.name}</p>
                    <Badge variant="secondary" className={`text-[10px] ${c.bg} ${c.text} border-none px-1.5 py-0 font-semibold`}>
                      {m.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">{m.relationship}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── MedCountBadge ─── */
function MedCountBadge({ count }: { count: number }) {
  return (
    <Card className="shadow-md shadow-sky-100/40 border-sky-100/60 bg-gradient-to-br from-sky-50/80 to-white animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-backwards">
      <CardContent className="py-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-sky-100 flex items-center justify-center shadow-sm shadow-sky-200/50">
            <Pill className="w-5 h-5 text-sky-600" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-sky-700 tracking-tight">{count}</span>
              <span className="text-sm font-medium text-sky-600/80">active</span>
            </div>
            <p className="text-xs text-sky-500/70">Track doses on medications page</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── TaskList (full CRUD) ─── */
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

  function dueDateLabel(dateStr: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const due = new Date(dateStr + 'T00:00:00'); due.setHours(0, 0, 0, 0)
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: 'text-red-500 font-semibold' }
    if (diff === 0) return { text: 'Today', color: 'text-amber-600 font-semibold' }
    if (diff === 1) return { text: 'Tomorrow', color: 'text-amber-500' }
    if (diff <= 7) return { text: `${diff} days`, color: 'text-zinc-500' }
    return { text: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-zinc-400' }
  }

  const pending = tasks.filter(t => t.status !== 'completed')
  const completed = tasks.filter(t => t.status === 'completed')

  return (
    <>
      <Card className="shadow-md shadow-zinc-100/50 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-backwards">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-zinc-800">Tasks</CardTitle>
              <CardDescription className="text-xs">
                {pending.length} pending{completed.length > 0 && ` · ${completed.length} done`}
              </CardDescription>
            </div>
            <Button size="sm" onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50">
              <Plus data-icon="inline-start" className="size-3.5" /> Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 && (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                <Circle className="w-6 h-6 text-rose-200" />
              </div>
              <p className="text-sm font-medium text-zinc-600">No tasks yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto">Add a task to coordinate care with the family</p>
            </div>
          )}

          <div className="space-y-1.5">
            {pending.map((task, i) => {
              const due = dueDateLabel(task.due_date)
              const assigneeColor = nameToColor(task.family_members?.name ?? '')
              return (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 lg:px-4 transition-all hover:border-rose-200 hover:shadow-sm hover:shadow-rose-100/40 animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-backwards"
                  style={{ animationDelay: `${200 + i * 60}ms` }}
                >
                  <button
                    onClick={() => toggleStatus(task)}
                    className="shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  >
                    <Circle className="w-[18px] h-[18px] text-zinc-300 group-hover:text-rose-400 transition-colors" />
                  </button>

                  {/* Title + description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-zinc-800 leading-snug truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    {/* Mobile: meta below title */}
                    <div className="flex items-center gap-2.5 mt-2 text-[11px] sm:hidden">
                      <span className={`flex items-center gap-1 ${assigneeColor.text}`}>
                        <span className={`w-4 h-4 rounded-full ${assigneeColor.bg} flex items-center justify-center text-[8px] font-bold`}>
                          {task.family_members?.name?.charAt(0)}
                        </span>
                        {task.family_members?.name?.split(' ')[0]}
                      </span>
                      <span className={`flex items-center gap-1 ${due.color}`}>
                        <CalendarDays className="w-3 h-3" />
                        {due.text}
                      </span>
                    </div>
                  </div>

                  {/* Desktop: assignee + due date as inline badges */}
                  <div className="hidden sm:flex items-center gap-3 shrink-0 text-[11px]">
                    <span className={`flex items-center gap-1.5 ${assigneeColor.text} rounded-full ${assigneeColor.bg} px-2 py-0.5`}>
                      <span className="font-semibold">{task.family_members?.name?.split(' ')[0]}</span>
                    </span>
                    <span className={`flex items-center gap-1 ${due.color} whitespace-nowrap`}>
                      <CalendarDays className="w-3 h-3" />
                      {due.text}
                    </span>
                  </div>

                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon-xs" onClick={() => openEdit(task)}>
                      <Pencil className="w-3 h-3 text-zinc-400 hover:text-zinc-600" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => confirmDelete(task)}>
                      <Trash2 className="w-3 h-3 text-zinc-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {completed.length > 0 && (
              <div className="pt-4 mt-3 border-t border-dashed border-zinc-200">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Completed</p>
                {completed.map(task => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 rounded-xl p-2.5 opacity-50 hover:opacity-75 transition-opacity"
                  >
                    <button onClick={() => toggleStatus(task)} className="shrink-0 cursor-pointer transition-transform hover:scale-110">
                      <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400" />
                    </button>
                    <p className="text-[13px] text-zinc-400 line-through flex-1 truncate">{task.title}</p>
                    <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100" onClick={() => confirmDelete(task)}>
                      <Trash2 className="w-3 h-3 text-zinc-300" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
              <Label htmlFor="task-desc">Description <span className="text-zinc-400 font-normal">(optional)</span></Label>
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
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
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

/* ─── ActivityFeed (timeline style) ─── */
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

  function actionDot(type: string) {
    if (type.includes('completed')) return 'bg-emerald-400'
    if (type.includes('created') || type.includes('added')) return 'bg-sky-400'
    if (type.includes('deleted') || type.includes('removed')) return 'bg-red-300'
    if (type.includes('confirmed') || type.includes('logged')) return 'bg-violet-400'
    return 'bg-zinc-300'
  }

  return (
    <Card className="shadow-md shadow-zinc-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-backwards">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-zinc-800">Activity</CardTitle>
        <CardDescription className="text-xs">Recent care team actions</CardDescription>
      </CardHeader>
      <CardContent>
        {activity.length === 0 && (
          <div className="text-center py-6">
            <Clock className="w-5 h-5 text-zinc-200 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">Activity will appear here</p>
          </div>
        )}
        <div className="relative">
          {/* Timeline line */}
          {activity.length > 1 && (
            <div className="absolute left-[5px] top-3 bottom-3 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent" />
          )}
          <div className="space-y-0.5">
            {activity.map((a, i) => {
              const memberColor = nameToColor(a.family_members?.name ?? '')
              return (
                <div
                  key={a.id}
                  className="relative flex items-start gap-3 py-2 pl-0.5 animate-in fade-in duration-300 fill-mode-backwards"
                  style={{ animationDelay: `${350 + i * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 mt-1.5 w-[10px] h-[10px] rounded-full ${actionDot(a.action_type)} ring-2 ring-white shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      <span className={`font-semibold ${memberColor.text}`}>{a.family_members?.name?.split(' ')[0]}</span>{' '}
                      <span className="text-zinc-500">{a.description.charAt(0).toLowerCase() + a.description.slice(1)}</span>
                    </p>
                    <p className="text-[10px] text-zinc-300 mt-0.5 font-medium">{formatTime(a.created_at)}</p>
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
    <div className="space-y-6 lg:space-y-8">
      {/* Personalized greeting */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800 tracking-tight">
          {greeting()}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          {patient ? `Caring for ${patient.name}` : 'Loading...'}
        </p>
      </div>

      {/* Desktop: 3-column grid with wider main area. Mobile: single stack */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_420px] gap-6 lg:gap-8">
        {/* Main column — Patient + Tasks */}
        <div className="space-y-6">
          {patient && <PatientCard patient={patient} />}

          <TaskList
            tasks={tasks}
            members={members}
            userId={user.id}
            onMutate={fetchAll}
          />
        </div>

        {/* Sidebar — Care Team + Meds + Activity */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <FamilyAvatars members={members} />
          <MedCountBadge count={activeMedCount} />
          <ActivityFeed activity={activity} />
        </div>
      </div>
    </div>
  )
}
