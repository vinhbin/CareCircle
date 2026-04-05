# CareCircle — 3 New Features Design

> Validated 2026-04-05. Priority: Community Impact. Build order: Emergency QR Card → Voice Memo → Medical Binder.

---

## Feature 1: Emergency QR Card (~30 min) — COMPLETE ✅

Hardcoded static page at `/emergency/ba-lan` with Bà Lan's critical medical info. ER-optimized: bold red header, high-contrast, large type, print-friendly.

### Architecture

- `src/app/emergency/ba-lan/page.tsx` — client component, zero API calls, all data inline
- `src/app/emergency/ba-lan/layout.tsx` — minimal layout, no Nav, no UserProvider
- Dashboard "Emergency Card" button → QR code dialog via `qrcode` package
- Nav hides for `/emergency` routes (patched)

### What was built

- [x] Hardcoded emergency page with clinical ER red/white design
- [x] Sections: Patient Info, Primary Language (prominent blue), Allergies (red highlight), Medications (table), Emergency Contact, Primary Doctor
- [x] Print-friendly CSS (`@media print`)
- [x] Dashboard button generates QR code → dialog with scan + link
- [x] QR scans on phone → opens emergency page

---

## Feature 2: Voice Memo (~2 hrs) — COMPLETE ✅

Third tab in Add Note dialog. Record → Stop → Transcribe → edit → save.

### Architecture

- `src/app/api/notes/transcribe/route.ts` — POST, `{ audio: base64, mimeType }`, size < 10MB, calls `transcribeAudio()`
- `src/lib/gemini.ts` — new `transcribeAudio(base64Data, mimeType)`, same `inlineData` pattern as OCR
- `src/app/notes/page.tsx` — new "Voice Memo" tab

### What was built

- [x] Third tab "Voice Memo" in Add Note dialog (Manual | Scan Photo | Voice Memo)
- [x] Big rose mic button → pulsing animation while recording with elapsed timer (MM:SS)
- [x] Stop → audio playback card with play/pause + re-record option
- [x] "Transcribe with AI" button → Gemini multimodal speech-to-text
- [x] Transcribed text fills editable textarea, user fills doctor/specialty/date → Save
- [x] On failure: alert "Transcription unavailable — type your notes manually"
- [x] Browser compatibility: `audio/webm` with `audio/mp4` fallback
- [x] Rate-limited API endpoint (10 req/60s) with audio type + size validation
- [x] Activity log: `source: 'voice_memo'` → "Recorded a voice memo from Dr. Chen's visit"
- [x] No DB changes required — saves to existing `doctor_notes` table via `POST /api/notes`

---

## Feature 3: Smart Medical Binder (~3 hrs) — COMPLETE ✅

Upload medical documents, Gemini auto-classifies, organized gallery.

### Architecture

- `src/app/documents/page.tsx` — client page, upload dialog + gallery grid
- `src/app/api/documents/route.ts` — GET (list + uploader join) + POST (storage upload, classify, save, log)
- `src/app/api/documents/[id]/route.ts` — GET (signed URL, 1hr) + DELETE (storage + DB + log)
- `src/lib/gemini.ts` — new `classifyDocument(base64Data, mimeType)`

### What was built

- [x] Upload dialog with file picker (image/*, .pdf), client-side MIME + size validation
- [x] POST base64 → Supabase storage upload → Gemini classifyDocument → DB insert + activity log
- [x] Gallery grid with category badge (color pill), AI description, date, uploader
- [x] Category filter pills: All, Lab Result, Prescription, Insurance Card, Discharge Summary, Imaging/X-Ray, Other
- [x] Click card → full-size Dialog via signed URL (1hr expiry)
- [x] Delete with confirmation (removes storage + DB + activity log)
- [x] Empty state, loading skeletons, staggered fade-in animations matching design system
- [x] Nav: "Documents" link added after "Weekly Summary"
- [x] Rate-limited POST endpoint (10 req/60s) with MIME + size validation
- [x] Gemini classification fallback: `{ category: 'Other', description: fileName }` on failure

### Storage

- Bucket: `public: false`
- Viewing via signed URLs (1hr expiry) generated server-side

### Nav

- Add "Documents" link after "Weekly Summary"

---

## Design decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Emergency card approach | Hardcoded static | Zero failure points in demo, story matters more than token generation |
| Emergency card visual | Clinical ER red/white | Judges see it's designed for real medical use, not just pretty UI |
| Voice memo UX | Minimal Start/Stop/Transcribe | Kevin is stressed in a parking lot, not browsing a wizard |
| Document focus | Upload + auto-classify | Lisa's story: snap a photo, AI handles the rest |
| Storage bucket | Private + signed URLs | Medical documents are sensitive, even for a hackathon |
