// MEDICAL BINDER — Upload documents, Gemini auto-classifies, folder-based gallery
// GET  /api/documents       — All documents with uploader joined
// POST /api/documents       — Upload + classify + save
// GET  /api/documents/[id]  — Signed URL for viewing
// DELETE /api/documents/[id] — Remove document

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderOpen, Plus, Upload, FileText, Trash2, Eye, Sparkles,
  X, FlaskConical, Pill, CreditCard, ClipboardList, ScanLine, File,
  ChevronRight, ArrowLeft,
} from 'lucide-react'

type Document = {
  id: number
  file_name: string
  storage_path: string
  mime_type: string
  category: string
  ai_description: string
  created_at: string
  uploader: { id: number; name: string; avatar_url: string | null } | null
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; iconBg: string; icon: typeof FileText }> = {
  'Lab Result':        { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100', icon: FlaskConical },
  'Prescription':      { bg: 'bg-violet-50',  text: 'text-violet-600',  iconBg: 'bg-violet-100',  icon: Pill },
  'Insurance Card':    { bg: 'bg-sky-50',     text: 'text-sky-600',     iconBg: 'bg-sky-100',     icon: CreditCard },
  'Discharge Summary': { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-100',   icon: ClipboardList },
  'Imaging/X-Ray':     { bg: 'bg-rose-50',    text: 'text-rose-600',    iconBg: 'bg-rose-100',    icon: ScanLine },
  'Other':             { bg: 'bg-zinc-50',    text: 'text-zinc-600',    iconBg: 'bg-zinc-100',    icon: File },
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif', 'application/pdf']

export default function DocumentsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [documents, setDocuments] = useState<Document[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  // Folder navigation
  const [openFolder, setOpenFolder] = useState<string | null>(null)

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ base64: string; name: string; mimeType: string; preview: string | null } | null>(null)

  // View dialog
  const [viewDoc, setViewDoc] = useState<Document | null>(null)
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  // Delete
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      if (Array.isArray(data)) setDocuments(data)
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  // Group documents by category
  const folders = useMemo(() => {
    const map: Record<string, Document[]> = {}
    for (const doc of documents) {
      const cat = doc.category || 'Other'
      if (!map[cat]) map[cat] = []
      map[cat].push(doc)
    }
    return map
  }, [documents])

  const folderDocs = openFolder ? (folders[openFolder] || []) : []

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Unsupported file type. Please upload an image or PDF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large — max 10 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      const isImage = file.type.startsWith('image/')
      setSelectedFile({
        base64,
        name: file.name,
        mimeType: file.type,
        preview: isImage ? dataUrl : null,
      })
    }
    reader.readAsDataURL(file)
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: selectedFile.base64,
          fileName: selectedFile.name,
          mimeType: selectedFile.mimeType,
          family_member_id: user?.id,
        }),
      })
      const newDoc = await res.json()
      if (newDoc.error) {
        alert(newDoc.error)
        return
      }
      setDocuments(prev => [newDoc, ...prev])
      setUploadOpen(false)
      setSelectedFile(null)
    } catch {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleView(doc: Document) {
    setViewDoc(doc)
    setViewUrl(null)
    setViewLoading(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}`)
      const { signedUrl } = await res.json()
      setViewUrl(signedUrl)
    } catch {
      alert('Failed to load document.')
      setViewDoc(null)
    } finally {
      setViewLoading(false)
    }
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.ai_description || doc.file_name}"?`)) return
    setDeleting(doc.id)
    try {
      await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
      if (viewDoc?.id === doc.id) setViewDoc(null)
      // If folder is now empty, go back to folders view
      const remaining = documents.filter(d => d.id !== doc.id && d.category === openFolder)
      if (openFolder && remaining.length === 0) setOpenFolder(null)
    } catch {
      alert('Failed to delete document.')
    } finally {
      setDeleting(null)
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!user) return null

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800 tracking-tight">Medical Binder</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Upload medical documents. AI organizes them automatically.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setUploadOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50 self-start sm:self-auto"
        >
          <Plus data-icon="inline-start" className="size-3.5" /> Upload Document
        </Button>
      </div>

      {/* Stats bar */}
      <Card className="shadow-md shadow-rose-100/50 border-rose-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-backwards">
        <div className="h-1.5 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300" />
        <CardContent className="py-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-lg shrink-0">
              <FolderOpen className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              {openFolder ? (
                <button
                  onClick={() => setOpenFolder(null)}
                  className="flex items-center gap-1.5 text-sm cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                  <span className="text-zinc-400 group-hover:text-rose-500 transition-colors font-medium">All Folders</span>
                  <ChevronRight className="w-3 h-3 text-zinc-300" />
                  <span className="font-semibold text-zinc-700">{openFolder}</span>
                </button>
              ) : (
                <p className="text-sm font-medium text-zinc-600">
                  {Object.keys(folders).length} folder{Object.keys(folders).length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-none text-[10px] font-semibold px-2 py-0.5 shrink-0">
              {openFolder ? folderDocs.length : documents.length} doc{(openFolder ? folderDocs.length : documents.length) !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {initialLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="shadow-md shadow-zinc-100/50 animate-in fade-in duration-300" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="py-8 space-y-3 flex flex-col items-center">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && documents.length === 0 && (
        <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-7 h-7 text-rose-200" />
          </div>
          <p className="text-sm font-medium text-zinc-600">No documents yet</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-[260px] mx-auto">Upload a lab result, prescription, or insurance card — AI will classify it into folders for you</p>
          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="mt-4 bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50"
          >
            <Plus data-icon="inline-start" className="size-3.5" /> Upload First Document
          </Button>
        </div>
      )}

      {/* ─── FOLDERS VIEW ─── */}
      {!initialLoading && !openFolder && Object.keys(folders).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(folders).map(([category, docs], i) => {
            const style = CATEGORY_STYLES[category] || CATEGORY_STYLES['Other']
            const Icon = style.icon
            return (
              <button
                key={category}
                onClick={() => setOpenFolder(category)}
                className="text-left cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
                style={{ animationDelay: `${150 + i * 80}ms` }}
              >
                <Card className="shadow-md shadow-zinc-100/50 border-zinc-100/60 overflow-hidden transition-all hover:border-rose-200 hover:shadow-rose-100/40 hover:scale-[1.02] h-full">
                  <CardContent className="py-6 flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${style.text}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-700">{category}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {docs.length} document{docs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      )}

      {/* ─── FOLDER CONTENTS VIEW ─── */}
      {!initialLoading && openFolder && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {folderDocs.map((doc, i) => {
            const style = CATEGORY_STYLES[doc.category] || CATEGORY_STYLES['Other']
            const Icon = style.icon
            return (
              <Card
                key={doc.id}
                className="shadow-md shadow-zinc-100/50 border-zinc-100/60 overflow-hidden transition-all hover:border-rose-200 hover:shadow-rose-100/40 group animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                {/* Card top — clickable area */}
                <button
                  onClick={() => handleView(doc)}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="h-32 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 flex items-center justify-center border-b border-zinc-100 group-hover:from-rose-50/50 group-hover:to-rose-50/30 transition-colors">
                    {doc.mime_type.startsWith('image/') ? (
                      <div className="flex flex-col items-center gap-2 text-zinc-300">
                        <Icon className="w-8 h-8" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-300">
                        <FileText className="w-8 h-8" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">PDF</span>
                      </div>
                    )}
                  </div>
                </button>

                <CardContent className="py-3.5 space-y-2.5">
                  {/* Category badge + delete */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.bg} ${style.text}`}>
                      <Icon className="w-3 h-3" />
                      {doc.category}
                    </span>
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deleting === doc.id}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* AI description */}
                  <p className="text-[13px] font-medium text-zinc-700 leading-snug line-clamp-2">
                    {doc.ai_description || doc.file_name}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{formatDate(doc.created_at)}</span>
                    {doc.uploader && (
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-rose-200 flex items-center justify-center text-[8px] font-bold text-rose-700">
                          {doc.uploader.name.charAt(0)}
                        </span>
                        {doc.uploader.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Upload Dialog ─── */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) setSelectedFile(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>

          {!selectedFile ? (
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:border-rose-300 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf,.avif"
                onChange={handleFileSelect}
                className="hidden"
                id="doc-file-input"
              />
              <label htmlFor="doc-file-input" className="cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-rose-400" />
                </div>
                <p className="text-sm font-medium text-zinc-600">Click to select a file</p>
                <p className="text-[11px] text-zinc-400 mt-1">Images (JPG, PNG, HEIC) or PDF · Max 10 MB</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedFile.preview ? (
                <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedFile.preview} alt="Preview" className="w-full max-h-56 object-cover" />
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-200 p-6 flex items-center gap-3 bg-zinc-50">
                  <FileText className="w-8 h-8 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-700">{selectedFile.name}</p>
                    <p className="text-[11px] text-zinc-400">PDF document</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 rounded-lg p-2.5 text-[11px] text-amber-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                AI will automatically classify this document
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                className="text-[11px] font-medium text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors"
              >
                Choose a different file
              </button>
            </div>
          )}

          {uploading && (
            <div className="flex items-center gap-3 text-sm bg-amber-50 border border-amber-200/60 rounded-xl p-3.5">
              <span className="w-4.5 h-4.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <p className="font-medium text-amber-700">Uploading &amp; classifying...</p>
                <p className="text-[11px] text-amber-500 mt-0.5">Gemini is analyzing your document</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadOpen(false); setSelectedFile(null) }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Document Dialog ─── */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => { if (!open) { setViewDoc(null); setViewUrl(null) } }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {viewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-rose-400" />
                  {viewDoc.ai_description || viewDoc.file_name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const style = CATEGORY_STYLES[viewDoc.category] || CATEGORY_STYLES['Other']
                    const Icon = style.icon
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.bg} ${style.text}`}>
                        <Icon className="w-3 h-3" />
                        {viewDoc.category}
                      </span>
                    )
                  })()}
                  <span className="text-[11px] text-zinc-400">{formatDate(viewDoc.created_at)}</span>
                  {viewDoc.uploader && (
                    <span className="text-[11px] text-zinc-400">· Uploaded by {viewDoc.uploader.name}</span>
                  )}
                </div>

                {viewLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : viewUrl ? (
                  viewDoc.mime_type.startsWith('image/') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={viewUrl} alt={viewDoc.ai_description || viewDoc.file_name} className="w-full rounded-lg border border-zinc-200 shadow-sm" />
                  ) : (
                    <iframe src={viewUrl} title={viewDoc.file_name} className="w-full h-[60vh] rounded-lg border border-zinc-200" />
                  )
                ) : null}
              </div>

              <DialogFooter className="flex-row justify-between sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(viewDoc)}
                  disabled={deleting === viewDoc.id}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting === viewDoc.id ? 'Deleting...' : 'Delete'}
                </Button>
                <Button variant="outline" onClick={() => { setViewDoc(null); setViewUrl(null) }}>
                  <X className="w-3.5 h-3.5" /> Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
