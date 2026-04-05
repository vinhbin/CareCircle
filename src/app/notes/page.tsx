// PERSON B — Doctor Notes
// GET  /api/notes                    — All notes with translations joined
// POST /api/notes                    — Create new note (manual or after photo scan)
// POST /api/notes/{id}/translate     — AI translation in any of 10 languages
// POST /api/notes/scan               — Photo → Gemini OCR → extracted text
//
// Features:
//   - Note cards with raw medical text
//   - "Explain in [language]" translate button per note
//   - "Add Doctor Note" dialog with Manual Entry + Scan Photo tabs
//   - Language selector (global for all notes)

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LANGUAGES } from '@/lib/languages'
import { useUser } from '@/lib/user-context'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText, Languages, Plus, Stethoscope, CalendarDays,
  Camera, Upload, Sparkles, ChevronRight, Mic, Square, Play, Pause
} from 'lucide-react'

type Translation = { translation: string; actionItems: string; language?: string }
type DBTranslation = { translation: string; action_items: string }
type Note = {
  id: number
  doctor_name: string
  specialty: string
  visit_date: string
  raw_notes: string
  ai_translations: DBTranslation[]
}

export default function NotesPage() {
  const router = useRouter()
  const { user } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [translations, setTranslations] = useState<Record<number, Translation>>({})
  const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt')

  // Add Note dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'manual' | 'scan' | 'voice'>('manual')
  const [noteForm, setNoteForm] = useState({ doctor_name: '', specialty: '', visit_date: '', raw_notes: '' })
  const [saving, setSaving] = useState(false)

  // Scan state
  const [scanning, setScanning] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Voice memo state
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [elapsedTimer, setElapsedTimer] = useState<ReturnType<typeof setInterval> | null>(null)
  const audioPreviewRef = useRef<HTMLAudioElement>(null)

  async function handleStartRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks, { type: mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }

      recorder.start()
      setMediaRecorder(recorder)
      setRecording(true)
      setElapsed(0)
      setAudioBlob(null)
      setAudioUrl(null)
      setNoteForm(f => ({ ...f, raw_notes: '' }))

      const timer = setInterval(() => setElapsed(s => s + 1), 1000)
      setElapsedTimer(timer)
    } catch {
      alert('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  function handleStopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    setRecording(false)
    if (elapsedTimer) { clearInterval(elapsedTimer); setElapsedTimer(null) }
  }

  async function handleTranscribe() {
    if (!audioBlob) return
    setTranscribing(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.readAsDataURL(audioBlob)
      })

      const res = await fetch('/api/notes/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64, mimeType: audioBlob.type }),
      })
      const { transcribedText, error } = await res.json()
      if (transcribedText) {
        setNoteForm(f => ({ ...f, raw_notes: transcribedText }))
      } else {
        alert(error || 'Transcription unavailable — type your notes manually')
      }
    } catch {
      alert('Transcription failed. Please type your notes manually.')
    } finally {
      setTranscribing(false)
    }
  }

  function formatElapsed(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function resetVoiceState() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecording(false)
    setElapsed(0)
    setAudioPlaying(false)
    if (elapsedTimer) { clearInterval(elapsedTimer); setElapsedTimer(null) }
  }

  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => {
        setNotes(data)
        const existing: Record<number, Translation> = {}
        data.forEach((n: Note) => {
          if (n.ai_translations?.length) existing[n.id] = {
            translation: n.ai_translations[0].translation,
            actionItems: n.ai_translations[0].action_items,
          }
        })
        setTranslations(existing)
      })
      .finally(() => setInitialLoading(false))
  }, [])

  async function handleTranslate(noteId: number) {
    setLoading(prev => ({ ...prev, [noteId]: true }))
    try {
      const res = await fetch(`/api/notes/${noteId}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLanguage })
      })
      const result = await res.json()
      setTranslations(prev => ({ ...prev, [noteId]: { ...result, language: selectedLanguage } }))
    } finally {
      setLoading(prev => ({ ...prev, [noteId]: false }))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type

      setImagePreview(dataUrl)
      setScanning(true)

      try {
        const res = await fetch('/api/notes/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType }),
        })
        const { extractedText, error } = await res.json()
        if (extractedText) {
          setNoteForm(f => ({ ...f, raw_notes: extractedText }))
        } else {
          alert(error || 'Failed to extract text from image')
        }
      } catch {
        alert('Failed to scan image. Please try again.')
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveNote() {
    if (!noteForm.doctor_name || !noteForm.specialty || !noteForm.visit_date || !noteForm.raw_notes) return
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteForm, family_member_id: user?.id }),
      })
      const newNote = await res.json()
      setNotes(prev => [newNote, ...prev])
      setDialogOpen(false)
      setNoteForm({ doctor_name: '', specialty: '', visit_date: '', raw_notes: '' })
      setImagePreview(null)
      setActiveTab('manual')
    } finally {
      setSaving(false)
    }
  }

  function formatVisitDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!user) return null

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800 tracking-tight">Doctor Notes</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Medical visit records for Bà Lan. Translate into plain language for the family.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50 self-start sm:self-auto"
        >
          <Plus data-icon="inline-start" className="size-3.5" /> Add Note
        </Button>
      </div>

      {/* Language selector bar */}
      <Card className="shadow-md shadow-rose-100/50 border-rose-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-backwards">
        <div className="h-1 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300" />
        <CardContent className="py-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-lg shrink-0">
              <Languages className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Translate into</p>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="text-sm font-medium text-zinc-800 bg-transparent border-none outline-none cursor-pointer p-0 -ml-0.5"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-none text-[10px] font-semibold px-2 py-0.5 shrink-0">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {initialLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <Card key={i} className="shadow-md shadow-zinc-100/50 animate-in fade-in duration-300" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-9 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && notes.length === 0 && (
        <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-rose-200" />
          </div>
          <p className="text-sm font-medium text-zinc-600">No doctor notes yet</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-[240px] mx-auto">Add a note from a recent visit to get AI translations for the family</p>
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="mt-4 bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50"
          >
            <Plus data-icon="inline-start" className="size-3.5" /> Add First Note
          </Button>
        </div>
      )}

      {/* Notes list */}
      {!initialLoading && (
        <div className="space-y-4">
          {notes.map((note, i) => (
            <Card
              key={note.id}
              className="shadow-md shadow-zinc-100/50 border-zinc-100/60 overflow-hidden transition-all hover:border-rose-200 hover:shadow-rose-100/40 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-[13px] font-medium text-zinc-800">{note.doctor_name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-sky-50 text-sky-600 border-none text-[10px] font-semibold px-1.5 py-0">
                      {note.specialty}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <CalendarDays className="w-3 h-3" />
                      {formatVisitDate(note.visit_date)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Raw medical notes */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Original Notes</p>
                  <p className="text-[13px] text-zinc-600 leading-relaxed font-mono whitespace-pre-line">{note.raw_notes}</p>
                </div>

                {/* Translation panel */}
                {translations[note.id] ? (
                  <div className="bg-gradient-to-br from-rose-50 via-amber-50/50 to-rose-50 rounded-xl p-4 border border-rose-200/60 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-widest">
                          AI Translation {translations[note.id].language && translations[note.id].language !== 'English' ? `· ${translations[note.id].language}` : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => handleTranslate(note.id)}
                        disabled={loading[note.id]}
                        className="text-[11px] font-medium text-rose-500 hover:text-rose-600 disabled:opacity-50 cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        {loading[note.id] ? (
                          <>
                            <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>Retranslate in {selectedLanguage}</>
                        )}
                      </button>
                    </div>

                    <p className="text-[13px] text-zinc-700 leading-relaxed whitespace-pre-line">{translations[note.id].translation}</p>

                    {translations[note.id].actionItems && (
                      <div className="mt-3 pt-3 border-t border-rose-200/40">
                        <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Action Items</p>
                        <p className="text-[13px] font-medium text-amber-800 leading-relaxed whitespace-pre-line">{translations[note.id].actionItems}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleTranslate(note.id)}
                    disabled={loading[note.id]}
                    className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50"
                    size="sm"
                  >
                    {loading[note.id] ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                        Translating for your family...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5" />
                        Explain in {selectedLanguage}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Add Note Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Doctor Note</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Manual
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-white text-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Scan Photo
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'voice'
                  ? 'bg-white text-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Memo
            </button>
          </div>

          {/* Common fields */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doctor_name">Doctor Name</Label>
                <Input
                  id="doctor_name"
                  value={noteForm.doctor_name}
                  onChange={e => setNoteForm(f => ({ ...f, doctor_name: e.target.value }))}
                  placeholder="e.g. Dr. Jennifer Tran"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={noteForm.specialty}
                  onChange={e => setNoteForm(f => ({ ...f, specialty: e.target.value }))}
                  placeholder="e.g. Primary Care"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit_date">Visit Date</Label>
              <Input
                id="visit_date"
                type="date"
                value={noteForm.visit_date}
                onChange={e => setNoteForm(f => ({ ...f, visit_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Manual tab — just a textarea */}
          {activeTab === 'manual' && (
            <div className="space-y-1.5">
              <Label htmlFor="raw_notes">Doctor&apos;s Notes</Label>
              <Textarea
                id="raw_notes"
                value={noteForm.raw_notes}
                onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                placeholder="Paste or type the doctor's notes here..."
                rows={6}
              />
            </div>
          )}

          {/* Scan tab — file input + preview + extracted text */}
          {activeTab === 'scan' && (
            <div className="space-y-3">
              <div>
                <Label>Upload or take a photo</Label>
                <div className="mt-1.5 border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:border-rose-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="scan-file-input"
                  />
                  <label htmlFor="scan-file-input" className="cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600">Click to upload or take a photo</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Supports JPG, PNG, HEIC</p>
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Scanned note" className="w-full max-h-48 object-cover" />
                </div>
              )}

              {scanning && (
                <div className="flex items-center gap-3 text-sm bg-amber-50 border border-amber-200/60 rounded-xl p-3.5">
                  <span className="w-4.5 h-4.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <p className="font-medium text-amber-700">Reading document with AI...</p>
                    <p className="text-[11px] text-amber-500 mt-0.5">Gemini is extracting text from your photo</p>
                  </div>
                </div>
              )}

              {noteForm.raw_notes && activeTab === 'scan' && !scanning && (
                <div className="space-y-1.5">
                  <Label htmlFor="extracted_notes" className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    Extracted Text
                    <span className="text-zinc-400 font-normal">(review &amp; edit)</span>
                  </Label>
                  <Textarea
                    id="extracted_notes"
                    value={noteForm.raw_notes}
                    onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                    rows={6}
                  />
                </div>
              )}
            </div>
          )}

          {/* Voice Memo tab — record → stop → transcribe → edit */}
          {activeTab === 'voice' && (
            <div className="space-y-3">
              {/* Recording controls */}
              {!audioBlob && !recording && (
                <div className="text-center py-6">
                  <button
                    onClick={handleStartRecording}
                    className="group w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200/60 flex items-center justify-center mx-auto transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-8 h-8 text-white" />
                  </button>
                  <p className="text-sm font-medium text-zinc-600 mt-3">Tap to start recording</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Record your voice memo from the visit</p>
                </div>
              )}

              {/* Recording in progress */}
              {recording && (
                <div className="text-center py-6 animate-in fade-in duration-300">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping pointer-events-none" />
                    <button
                      onClick={handleStopRecording}
                      className="relative w-20 h-20 rounded-full bg-rose-500 shadow-lg shadow-rose-200/60 flex items-center justify-center mx-auto cursor-pointer hover:bg-rose-600 transition-colors"
                    >
                      <Square className="w-7 h-7 text-white fill-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-semibold text-rose-600 tabular-nums">{formatElapsed(elapsed)}</span>
                    <span className="text-sm text-zinc-500">Recording...</span>
                  </div>
                </div>
              )}

              {/* Audio playback + transcribe */}
              {audioBlob && !recording && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const audio = audioPreviewRef.current
                          if (!audio) return
                          if (audioPlaying) { audio.pause(); audio.currentTime = 0; setAudioPlaying(false) }
                          else { audio.play(); setAudioPlaying(true) }
                        }}
                        className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      >
                        {audioPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-700">Voice Memo</p>
                        <p className="text-[11px] text-zinc-400">{formatElapsed(elapsed)} recorded</p>
                      </div>
                      <button
                        onClick={() => { resetVoiceState(); setNoteForm(f => ({ ...f, raw_notes: '' })) }}
                        className="text-[11px] font-medium text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors"
                      >
                        Re-record
                      </button>
                    </div>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <audio
                      ref={audioPreviewRef}
                      src={audioUrl ?? undefined}
                      onEnded={() => setAudioPlaying(false)}
                      className="hidden"
                    />
                  </div>

                  {/* Transcribe button */}
                  {!noteForm.raw_notes && !transcribing && (
                    <Button
                      onClick={handleTranscribe}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50"
                      size="sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Transcribe with AI
                    </Button>
                  )}

                  {/* Transcribing spinner */}
                  {transcribing && (
                    <div className="flex items-center gap-3 text-sm bg-amber-50 border border-amber-200/60 rounded-xl p-3.5">
                      <span className="w-4.5 h-4.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      <div>
                        <p className="font-medium text-amber-700">Transcribing audio...</p>
                        <p className="text-[11px] text-amber-500 mt-0.5">Gemini is converting speech to text</p>
                      </div>
                    </div>
                  )}

                  {/* Transcribed text — editable */}
                  {noteForm.raw_notes && activeTab === 'voice' && !transcribing && (
                    <div className="space-y-1.5">
                      <Label htmlFor="transcribed_notes" className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        Transcribed Text
                        <span className="text-zinc-400 font-normal">(review &amp; edit)</span>
                      </Label>
                      <Textarea
                        id="transcribed_notes"
                        value={noteForm.raw_notes}
                        onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                        rows={6}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setImagePreview(null); setActiveTab('manual') }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={saving || !noteForm.doctor_name || !noteForm.specialty || !noteForm.visit_date || !noteForm.raw_notes}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
