// MEDICAL BINDER — matches App Builder layout
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderOpen, Upload, FileText, Trash2, Sparkles,
  X, ChevronRight,
  TestTube, Pill, FileSpreadsheet, Image as ImageIcon, Heart, File,
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

/* ─── Folder category config matching App Builder ─── */
const FOLDER_CATEGORIES: Record<string, { icon: typeof FileText; color: string; bg: string; emoji: string }> = {
  'Lab Result':        { icon: TestTube,       color: 'text-[#0ea5e9]', bg: 'bg-[#e0f2fe]', emoji: '📊' },
  'Lab Results':       { icon: TestTube,       color: 'text-[#0ea5e9]', bg: 'bg-[#e0f2fe]', emoji: '📊' },
  'Prescription':      { icon: Pill,           color: 'text-[#10b981]', bg: 'bg-[#d1fae5]', emoji: '💊' },
  'Insurance Card':    { icon: FileSpreadsheet,color: 'text-[#f59e0b]', bg: 'bg-[#fef3c7]', emoji: '🏥' },
  'Insurance':         { icon: FileSpreadsheet,color: 'text-[#f59e0b]', bg: 'bg-[#fef3c7]', emoji: '🏥' },
  'Imaging/X-Ray':     { icon: ImageIcon,      color: 'text-[#8b5cf6]', bg: 'bg-[#ede9fe]', emoji: '🩻' },
  'Imaging':           { icon: ImageIcon,      color: 'text-[#8b5cf6]', bg: 'bg-[#ede9fe]', emoji: '🩻' },
  'Discharge Summary': { icon: Heart,          color: 'text-[#f43f5e]', bg: 'bg-[#ffe4e6]', emoji: '📋' },
  'Cardiology':        { icon: Heart,          color: 'text-[#f43f5e]', bg: 'bg-[#ffe4e6]', emoji: '❤️' },
  'Other':             { icon: File,           color: 'text-[#64748b]', bg: 'bg-[#f1f5f9]', emoji: '📄' },
}

function getCategoryStyle(category: string) {
  return FOLDER_CATEGORIES[category] || FOLDER_CATEGORIES['Other']
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
    <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Medical Binder</h1>
          <p className="text-[#64748b]">Organize and access all medical documents</p>
        </div>
        <Button
          data-tour="upload-btn"
          onClick={() => setUploadOpen(true)}
          className="rounded-xl bg-[#f43f5e] hover:bg-[#f43f5e]/90 hidden sm:flex"
        >
          <Upload size={18} />
          Upload Document
        </Button>
      </div>

      {/* Breadcrumb (when inside a folder) */}
      {openFolder && (
        <div className="mb-6">
          <button
            onClick={() => setOpenFolder(null)}
            className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#f43f5e] transition-colors cursor-pointer"
          >
            <span>All Folders</span>
            <ChevronRight size={16} />
            <span className="text-[#0f172a] font-medium">{openFolder}</span>
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {initialLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="rounded-2xl border-gray-200 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && documents.length === 0 && (
        <div className="text-center py-16">
          <div className="size-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="text-[#94a3b8]" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-[#0f172a] mb-2">No documents yet</h3>
          <p className="text-[#64748b] max-w-[300px] mx-auto">
            Upload a lab result, prescription, or insurance card — AI will classify it into folders for you
          </p>
          <Button
            onClick={() => setUploadOpen(true)}
            className="mt-5 rounded-xl bg-[#f43f5e] hover:bg-[#f43f5e]/90"
          >
            <Upload size={18} />
            Upload First Document
          </Button>
        </div>
      )}

      {/* ─── FOLDERS VIEW ─── */}
      {!initialLoading && !openFolder && Object.keys(folders).length > 0 && (
        <div data-tour="folder-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(folders).map(([category, docs]) => {
            const style = getCategoryStyle(category)
            const Icon = style.icon
            return (
              <button
                key={category}
                onClick={() => setOpenFolder(category)}
                className="text-left cursor-pointer"
              >
                <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                  <CardContent className="p-6">
                    <div className={`size-14 rounded-2xl ${style.bg} flex items-center justify-center mb-4`}>
                      <Icon className={style.color} size={28} />
                    </div>
                    <h3 className="font-semibold text-[#0f172a] mb-2 text-lg">
                      {category}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#64748b]">
                        {docs.length} {docs.length === 1 ? 'document' : 'documents'}
                      </p>
                      <ChevronRight size={20} className="text-[#64748b]" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {folderDocs.map((doc) => {
            const style = getCategoryStyle(doc.category)
            return (
              <Card
                key={doc.id}
                className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleView(doc)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Emoji thumbnail */}
                    <div className="size-16 rounded-xl bg-[#f8fafc] flex items-center justify-center text-3xl flex-shrink-0">
                      {style.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0f172a] mb-2 line-clamp-1">
                        {doc.ai_description || doc.file_name}
                      </h3>
                      <Badge className={`${style.bg} ${style.color} border-0 rounded-lg mb-2`}>
                        {doc.category}
                      </Badge>
                      <p className="text-sm text-[#64748b] mb-3 line-clamp-2">
                        {doc.ai_description || doc.file_name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[#64748b]">
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.uploader && (
                          <>
                            <span>•</span>
                            <span>By {doc.uploader.name.split(' ')[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Upload Dialog ─── */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) setSelectedFile(null) }}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Upload Document</DialogTitle>
            <DialogDescription>
              Upload a medical document and let AI categorize it automatically
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#f43f5e] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf,.avif"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="doc-file-input"
                />
                <label htmlFor="doc-file-input" className="cursor-pointer">
                  <Upload size={48} className="mx-auto text-[#64748b] mb-4" />
                  <p className="text-[#0f172a] font-medium mb-2">
                    Drop file here or click to upload
                  </p>
                  <p className="text-sm text-[#64748b]">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedFile.preview ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedFile.preview} alt="Preview" className="w-full max-h-56 object-cover" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 p-6 flex items-center gap-3 bg-[#f8fafc]">
                    <FileText className="w-8 h-8 text-[#64748b]" />
                    <div>
                      <p className="text-sm font-medium text-[#0f172a]">{selectedFile.name}</p>
                      <p className="text-xs text-[#64748b]">PDF document</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm font-medium text-[#64748b] hover:text-[#0f172a] cursor-pointer transition-colors"
                >
                  Choose a different file
                </button>
              </div>
            )}

            {/* AI classification info */}
            <div data-tour="ai-classify" className="bg-[#ede9fe] rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="text-[#8b5cf6] mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0f172a] mb-1">
                  AI Classification
                </p>
                <p className="text-sm text-[#64748b]">
                  Your document will be automatically categorized and a description will be generated
                </p>
              </div>
            </div>

            {uploading && (
              <div className="flex items-center gap-3 text-sm bg-[#ede9fe] border border-[#8b5cf6]/20 rounded-xl p-4">
                <span className="w-5 h-5 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="font-medium text-[#0f172a]">Uploading &amp; classifying with AI...</p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="w-full rounded-xl bg-[#f43f5e] hover:bg-[#f43f5e]/90"
            >
              {uploading ? 'Uploading...' : 'Upload & Classify'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── View Document Dialog ─── */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => { if (!open) { setViewDoc(null); setViewUrl(null) } }}>
        <DialogContent className="rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl pr-8">
                  {viewDoc.ai_description || viewDoc.file_name}
                </DialogTitle>
                <div className="flex items-center gap-3 pt-2">
                  {(() => {
                    const style = getCategoryStyle(viewDoc.category)
                    return (
                      <Badge className={`${style.bg} ${style.color} border-0 rounded-lg`}>
                        {viewDoc.category}
                      </Badge>
                    )
                  })()}
                  <span className="text-sm text-[#64748b]">{formatDate(viewDoc.created_at)}</span>
                  {viewDoc.uploader && (
                    <>
                      <span className="text-sm text-[#64748b]">•</span>
                      <span className="text-sm text-[#64748b]">Uploaded by {viewDoc.uploader.name}</span>
                    </>
                  )}
                </div>
              </DialogHeader>

              <div className="mt-4">
                {/* AI Description */}
                <div className="bg-[#ede9fe] rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="text-[#8b5cf6] mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0f172a] mb-1">
                        AI-Generated Description
                      </p>
                      <p className="text-sm text-[#64748b]">
                        {viewDoc.ai_description || 'No description available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document preview */}
                {viewLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="w-6 h-6 border-2 border-[#f43f5e] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : viewUrl ? (
                  viewDoc.mime_type.startsWith('image/') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={viewUrl} alt={viewDoc.ai_description || viewDoc.file_name} className="w-full rounded-lg border border-gray-200 shadow-sm" />
                  ) : (
                    <iframe src={viewUrl} title={viewDoc.file_name} className="w-full h-[60vh] rounded-lg border border-gray-200" />
                  )
                ) : (
                  <div className="bg-[#f8fafc] rounded-2xl p-12 text-center border-2 border-gray-200">
                    <div className="text-6xl mb-4">{getCategoryStyle(viewDoc.category).emoji}</div>
                    <p className="text-[#64748b]">Document preview</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-row justify-between sm:justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(viewDoc)}
                  disabled={deleting === viewDoc.id}
                  className="text-[#f43f5e] hover:text-[#f43f5e] hover:bg-[#fff1f2] border-[#f43f5e]/30"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting === viewDoc.id ? 'Deleting...' : 'Delete'}
                </Button>
                <Button variant="outline" onClick={() => { setViewDoc(null); setViewUrl(null) }}>
                  <X className="w-4 h-4" /> Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <Button
        onClick={() => setUploadOpen(true)}
        size="lg"
        className="sm:hidden fixed bottom-20 right-4 size-14 rounded-full shadow-lg bg-[#f43f5e] hover:bg-[#f43f5e]/90 z-30"
      >
        <Upload size={24} />
      </Button>
    </div>
  )
}
