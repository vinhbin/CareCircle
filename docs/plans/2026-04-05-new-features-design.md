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

## Feature 2: Voice Memo (~2 hrs)

Third tab in Add Note dialog. Record → Stop → Transcribe → edit → save.

### Architecture

- `src/app/api/notes/transcribe/route.ts` — POST, `{ audio: base64, mimeType }`, size < 10MB, calls `transcribeAudio()`
- `src/lib/gemini.ts` — new `transcribeAudio(base64Data, mimeType)`, same `inlineData` pattern as OCR
- `src/app/notes/page.tsx` — new "Voice Memo" tab

### UI flow

1. Add Note → "Voice Memo" tab
2. Big red mic button → pulses "Recording..." with elapsed time
3. Stop → `<audio>` playback to review
4. "Transcribe" → spinner → text fills `raw_notes` textarea
5. Edit → fill doctor/specialty/date → Save
6. On failure: toast "Transcription unavailable — type your notes manually"

### Browser compatibility

- `MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'`
- Pass detected MIME to API

### Activity log

- Saves with `source: 'voice_memo'` → "Recorded a voice memo from Dr. Chen's visit"

---

## Feature 3: Smart Medical Binder (~3 hrs)

Upload medical documents, Gemini auto-classifies, organized gallery.

### Architecture

- `src/app/documents/page.tsx` — client page, upload dialog + gallery grid
- `src/app/api/documents/route.ts` — GET (list + uploader join) + POST (storage upload, classify, save, log)
- `src/app/api/documents/[id]/route.ts` — GET (signed URL, 1hr) + DELETE (storage + DB + log)
- `src/lib/gemini.ts` — new `classifyDocument(base64Data, mimeType)`

### Upload flow

1. "Upload Document" → file picker (`image/*,.pdf`)
2. Client validates: MIME `image/*` or `application/pdf`, size < 10MB
3. POST base64 + fileName + mimeType + description + family_member_id
4. Backend: `supabase.storage.from('documents').upload()`
5. Backend: `classifyDocument()` → `{ category, description }`. Failure fallback: `{ category: 'Other', description: fileName }`
6. Backend: insert `documents` + activity log (error-checked)
7. Frontend: refresh gallery

### Gallery

- Grid of cards: thumbnail, category badge (color pill), AI description, date, uploader
- Click → full-size Dialog via signed URL
- Category filter pills: Lab Result, Prescription, Insurance Card, Discharge Summary, Imaging/X-Ray, Other

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
