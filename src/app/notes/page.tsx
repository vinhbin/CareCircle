// DOCTOR NOTES — matches App Builder layout
// GET  /api/notes                    — All notes with translations joined
// POST /api/notes                    — Create new note (manual or after photo scan)
// POST /api/notes/{id}/translate     — AI translation in any of 10 languages
// POST /api/notes/scan               — Photo → Gemini OCR → extracted text
// POST /api/notes/transcribe         — Audio → Gemini transcription

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LANGUAGES } from '@/lib/languages'
import { useUser } from '@/lib/user-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText, Plus, ChevronDown,
  Camera, Sparkles, Mic, Square, Play, Pause
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

/* ─── Specialty badge colors ─── */
const SPECIALTY_COLORS: Record<string, string> = {
  'Cardiology': 'bg-[#f43f5e]',
  'Endocrinology': 'bg-[#0ea5e9]',
  'Primary Care': 'bg-[#10b981]',
  'Nephrology': 'bg-[#8b5cf6]',
  'Neurology': 'bg-[#f59e0b]',
  'Oncology': 'bg-[#dc2626]',
  'Pulmonology': 'bg-[#14b8a6]',
  'Rheumatology': 'bg-[#6366f1]',
}

function specialtyColor(specialty: string) {
  return SPECIALTY_COLORS[specialty] || 'bg-[#64748b]'
}

/* ─── Language flags for inline selector ─── */
const LANGUAGE_FLAGS: Record<string, string> = {
  'English': '🇺🇸',
  'Tiếng Việt': '🇻🇳',
  'Español': '🇪🇸',
  '中文': '🇨🇳',
  '한국어': '🇰🇷',
  'Português': '🇧🇷',
  'Tagalog': '🇵🇭',
  'हिन्दी': '🇮🇳',
  'العربية': '🇸🇦',
  'Français': '🇫🇷',
}

export default function NotesPage() {
  const router = useRouter()
  const { user } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [translations, setTranslations] = useState<Record<number, Translation>>({})
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({})
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
      resetVoiceState()
    } finally {
      setSaving(false)
    }
  }

  function toggleNote(id: number) {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function formatVisitDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function previewText(text: string) {
    if (text.length <= 150) return text
    return text.substring(0, 150) + '...'
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Doctor Notes</h1>
          <p className="text-[#64748b]">Keep track of medical appointments and doctor notes</p>
        </div>
        <Button
          data-tour="add-note"
          onClick={() => setDialogOpen(true)}
          className="rounded-xl bg-[#f43f5e] hover:bg-[#f43f5e]/90 hidden sm:flex"
        >
          <Plus size={18} />
          Add Note
        </Button>
      </div>

      {/* Loading skeleton */}
      {initialLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <Card key={i} className="rounded-2xl border-gray-200 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && notes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-[#94a3b8]" />
          </div>
          <p className="text-lg font-medium text-[#0f172a]">No doctor notes yet</p>
          <p className="text-sm text-[#64748b] mt-1 max-w-[280px] mx-auto">
            Add a note from a recent visit to get AI translations for the family
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-5 rounded-xl bg-[#f43f5e] hover:bg-[#f43f5e]/90"
          >
            <Plus size={18} />
            Add First Note
          </Button>
        </div>
      )}

      {/* Notes list */}
      {!initialLoading && (
        <div className="space-y-4">
          {notes.map((note) => {
            const isExpanded = !!expandedNotes[note.id]
            return (
              <Card key={note.id} data-tour={note.id === notes[0]?.id ? "note-cards" : undefined} className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#0f172a]">{note.doctor_name}</h3>
                        <Badge className={`${specialtyColor(note.specialty)} text-white border-0 rounded-lg`}>
                          {note.specialty}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#64748b]">{formatVisitDate(note.visit_date)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNote(note.id)}
                      className="rounded-lg"
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </Button>
                  </div>

                  {/* Note text — preview or full */}
                  <p className="text-[#0f172a] mb-4">
                    {isExpanded ? note.raw_notes : previewText(note.raw_notes)}
                  </p>

                  {/* Expanded section — language selector + translation */}
                  {isExpanded && (
                    <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                      {/* Language selector buttons */}
                      <div data-tour="language-selector">
                        <Label className="mb-3 block">Translate to:</Label>
                        <div className="flex flex-wrap gap-2">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => setSelectedLanguage(lang.code)}
                              className={`px-3 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                                selectedLanguage === lang.code
                                  ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                                  : 'border-gray-200 hover:border-[#8b5cf6]/50'
                              }`}
                            >
                              <span className="mr-2">{LANGUAGE_FLAGS[lang.code] || '🌐'}</span>
                              <span className="text-sm">{lang.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Translate button */}
                      <Button
                        data-tour="translate-btn"
                        onClick={() => handleTranslate(note.id)}
                        disabled={loading[note.id]}
                        className="rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90"
                      >
                        {loading[note.id] ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                            Translating...
                          </span>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Translate
                          </>
                        )}
                      </Button>

                      {/* Translation result panel */}
                      {translations[note.id] && (
                        <div className="bg-gradient-to-br from-[#8b5cf6]/10 to-[#f59e0b]/10 rounded-2xl p-6 border-2 border-[#8b5cf6]/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-[#8b5cf6] text-white border-0 rounded-lg">
                              <Sparkles size={12} className="mr-1" />
                              AI Translated
                            </Badge>
                            <span className="text-sm text-[#64748b]">
                              {LANGUAGE_FLAGS[translations[note.id].language || selectedLanguage] || '🌐'}{' '}
                              {translations[note.id].language || selectedLanguage}
                            </span>
                          </div>
                          <p className="text-[#0f172a] leading-relaxed whitespace-pre-line">
                            {translations[note.id].translation}
                          </p>

                          {translations[note.id].actionItems && (
                            <div className="mt-4 pt-4 border-t border-[#8b5cf6]/20">
                              <p className="text-xs font-semibold text-[#92400e] uppercase tracking-widest mb-2">Action Items</p>
                              <p className="text-[#0f172a] leading-relaxed whitespace-pre-line">
                                {translations[note.id].actionItems}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Add Note Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Doctor Note</DialogTitle>
            <DialogDescription>
              Add a new note manually, scan a photo, or record a voice memo
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#f1f5f9] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <FileText size={16} />
              Manual
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Camera size={16} />
              Scan Photo
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'voice'
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Mic size={16} />
              Voice Memo
            </button>
          </div>

          {/* Common fields */}
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Doctor Name</Label>
              <Input
                value={noteForm.doctor_name}
                onChange={e => setNoteForm(f => ({ ...f, doctor_name: e.target.value }))}
                placeholder="Dr. Smith"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Input
                value={noteForm.specialty}
                onChange={e => setNoteForm(f => ({ ...f, specialty: e.target.value }))}
                placeholder="e.g. Cardiology"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Input
                type="date"
                value={noteForm.visit_date}
                onChange={e => setNoteForm(f => ({ ...f, visit_date: e.target.value }))}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Manual tab */}
          {activeTab === 'manual' && (
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={noteForm.raw_notes}
                onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                placeholder="Enter doctor's notes..."
                className="rounded-lg min-h-[120px]"
              />
            </div>
          )}

          {/* Scan tab */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#f43f5e] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="scan-file-input"
                />
                <label htmlFor="scan-file-input" className="cursor-pointer">
                  <Camera size={48} className="mx-auto text-[#64748b] mb-4" />
                  <p className="text-[#0f172a] font-medium mb-2">
                    Drop image here or click to upload
                  </p>
                  <p className="text-sm text-[#64748b]">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>

              {imagePreview && (
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Scanned note" className="w-full max-h-48 object-cover" />
                </div>
              )}

              {scanning && (
                <div className="flex items-center gap-3 text-sm bg-[#ede9fe] border border-[#8b5cf6]/20 rounded-xl p-4">
                  <span className="w-5 h-5 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="font-medium text-[#0f172a]">Extracting text with AI...</p>
                </div>
              )}

              {noteForm.raw_notes && activeTab === 'scan' && !scanning && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                    Extracted Text
                    <span className="text-[#94a3b8] font-normal">(review &amp; edit)</span>
                  </Label>
                  <Textarea
                    value={noteForm.raw_notes}
                    onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                    className="rounded-lg min-h-[120px]"
                  />
                </div>
              )}

              <Button
                disabled={scanning || !imagePreview}
                className="w-full rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90"
              >
                <Sparkles size={18} />
                Extract with AI
              </Button>
            </div>
          )}

          {/* Voice Memo tab */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              {/* Not recording, no blob */}
              {!audioBlob && !recording && (
                <div className="bg-[#f8fafc] rounded-2xl p-12 text-center">
                  <button
                    onClick={handleStartRecording}
                    className={`size-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all bg-[#f43f5e] hover:bg-[#f43f5e]/90 cursor-pointer hover:scale-105 active:scale-95`}
                  >
                    <Mic size={40} className="text-white" />
                  </button>
                  <p className="text-2xl font-semibold text-[#0f172a] mb-2">00:00</p>
                  <p className="text-sm text-[#64748b]">Tap to start recording</p>
                </div>
              )}

              {/* Recording in progress */}
              {recording && (
                <div className="bg-[#f8fafc] rounded-2xl p-12 text-center">
                  <button
                    onClick={handleStopRecording}
                    className="size-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#dc2626] animate-pulse cursor-pointer"
                  >
                    <Square size={32} className="text-white fill-white" />
                  </button>
                  <p className="text-2xl font-semibold text-[#0f172a] mb-2">{formatElapsed(elapsed)}</p>
                  <p className="text-sm text-[#64748b]">Tap to stop recording</p>
                </div>
              )}

              {/* Audio playback + transcribe */}
              {audioBlob && !recording && (
                <div className="space-y-4">
                  <div className="bg-[#f8fafc] rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const audio = audioPreviewRef.current
                          if (!audio) return
                          if (audioPlaying) { audio.pause(); audio.currentTime = 0; setAudioPlaying(false) }
                          else { audio.play(); setAudioPlaying(true) }
                        }}
                        className="w-12 h-12 rounded-full bg-[#f43f5e] hover:bg-[#f43f5e]/90 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      >
                        {audioPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <p className="font-medium text-[#0f172a]">Voice Memo</p>
                        <p className="text-sm text-[#64748b]">{formatElapsed(elapsed)} recorded</p>
                      </div>
                      <button
                        onClick={() => { resetVoiceState(); setNoteForm(f => ({ ...f, raw_notes: '' })) }}
                        className="text-sm font-medium text-[#64748b] hover:text-[#0f172a] cursor-pointer transition-colors"
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
                      className="w-full rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90"
                    >
                      <Sparkles size={18} />
                      Transcribe with AI
                    </Button>
                  )}

                  {/* Transcribing spinner */}
                  {transcribing && (
                    <div className="flex items-center gap-3 text-sm bg-[#ede9fe] border border-[#8b5cf6]/20 rounded-xl p-4">
                      <span className="w-5 h-5 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin shrink-0" />
                      <p className="font-medium text-[#0f172a]">Transcribing audio with AI...</p>
                    </div>
                  )}

                  {/* Transcribed text */}
                  {noteForm.raw_notes && activeTab === 'voice' && !transcribing && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                        Transcribed Text
                        <span className="text-[#94a3b8] font-normal">(review &amp; edit)</span>
                      </Label>
                      <Textarea
                        value={noteForm.raw_notes}
                        onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                        className="rounded-lg min-h-[120px]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setImagePreview(null); setActiveTab('manual'); resetVoiceState() }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={saving || !noteForm.doctor_name || !noteForm.specialty || !noteForm.visit_date || !noteForm.raw_notes}
              className="rounded-xl bg-[#f43f5e] hover:bg-[#f43f5e]/90 text-white"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <Button
        onClick={() => setDialogOpen(true)}
        size="lg"
        className="sm:hidden fixed bottom-20 right-4 size-14 rounded-full shadow-lg bg-[#f43f5e] hover:bg-[#f43f5e]/90 z-30"
      >
        <Plus size={24} />
      </Button>
    </div>
  )
}
