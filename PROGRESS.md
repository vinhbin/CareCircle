# CareCircle — Build Progress

> Last updated: 2026-04-04

---

## Backend V1 (Person C) — COMPLETE ✅

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/api/family` | GET | ✅ Done | Patient + 3 members + 5 tasks + med count |
| `/api/medications` | GET | ✅ Done | 4 active meds, sorted |
| `/api/notes` | GET | ✅ Done | 3 notes with ai_translations join |
| `/api/notes/[id]/translate` | POST | ✅ Done | Live Gemini 2.5-flash, 10 languages, array→string normalization |
| `/api/summary` | GET | ✅ Done | Returns latest saved summary |
| `/api/summary` | POST | ✅ Done | Live Gemini 2.5-flash, saves to DB |
| `/api/tasks` | GET | ✅ Done | Tasks with assignee name joined |
| `/api/tasks` | PATCH | ✅ Done | Update task status |

### Infrastructure
- [x] Supabase schema — 7 tables created
- [x] Seed data — Bà Lan, 3 family members, 4 meds, 3 doctor notes, 5 tasks
- [x] `src/lib/supabase.ts` — client singleton
- [x] `src/lib/gemini.ts` — translateNote + generateWeeklySummary (gemini-2.5-flash)
- [x] RLS disabled on all tables
- [x] `.env.local` — all 3 env vars set and working

---

## V2 Backend (Person C) — COMPLETE ✅

### New DB Tables
- [x] `medication_logs` — dose tracking (who gave what, when)
- [x] `activity_log` — action attribution (who did what, when)
- [x] RLS disabled on both new tables

### New Shared Libraries
- [x] `src/lib/user-context.tsx` — React context for selected family member
- [x] `src/lib/languages.ts` — shared 10-language constant

### New/Modified API Routes — All Verified ✅

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/api/family/members` | POST | ✅ Done | Add new family member |
| `/api/activity` | GET, POST | ✅ Done | Activity feed + log actions |
| `/api/medications/log` | GET, POST | ✅ Done | Dose tracking with live counts |
| `/api/medications` | POST | ✅ Done | Create medication + activity log |
| `/api/medications` | PATCH | ✅ Done | Update any field including active + activity log |
| `/api/medications` | DELETE | ✅ Done | Remove medication + activity log |
| `/api/tasks` | POST | ✅ Done | Create task + activity log |
| `/api/tasks` | PATCH | ✅ Done | Full field update + activity log |
| `/api/tasks` | DELETE | ✅ Done | Delete task + activity log |
| `/api/notes` | POST | ✅ Done | Add doctor note + activity log |
| `/api/notes/scan` | POST | ✅ Done | Photo → Gemini OCR → extracted text |
| `/api/summary/translate` | POST | ✅ Done | Translate summary via Gemini |

### New Gemini Functions
- [x] `extractTextFromImage()` — multimodal OCR for paper note scanning
- [x] `translateText()` — plain text translation

---

## V2 Frontend — Route Changes

| Page | Old Route | New Route | Status |
|---|---|---|---|
| User Selection | — | `/` | ✅ Done | Circle avatars, "Who's checking in?", Add Member dialog |
| Dashboard | `/` | `/dashboard` | ✅ Scaffold | APIs wired, needs Person A components |

---

## Shared

| Item | Status | Notes |
|---|---|---|
| Layout + Nav | ✅ Done | Logo, patient name, 5 nav links, active highlight, user avatar + "Switch" link |
| User Selection Page | ✅ Done | Circle avatars, Add Member dialog, redirects to /dashboard |
| User Context | ✅ Done | React context + localStorage persistence |
| Community Resources | ✅ Done | Static page at `/community` — broken links fixed |
| shadcn components | ✅ Done | card, badge, button, dialog, table, tabs, avatar, progress, skeleton, input, textarea, select, label |
| Doc comments | ✅ Done | All API routes, lib files, pages, and nav have doc comments |
| Color theme | 🔲 TODO | Rose/amber tones, not clinical blue |
| Loading states | 🔲 TODO | Skeletons, spinners |
| Responsive check | 🔲 TODO | All pages at 1440px |
| Vercel deploy | 🔲 TODO | Push to GitHub, add env vars |

---

## Frontend — Person A

| Page | Route | Status | Notes |
|---|---|---|---|
| Dashboard | `/dashboard` | 🔲 Scaffold | APIs wired. Build: PatientCard, FamilyAvatars, TaskList (CRUD dialogs), MedCountBadge, **ActivityFeed** |
| Medication Tracker | `/medications` | 🔲 Scaffold | APIs wired. Build: **Checklist cards** with live dose counts, progress bar, add/edit/delete dialogs |

---

## Frontend — Person B

| Page | Route | Status | Notes |
|---|---|---|---|
| Doctor Notes | `/notes` | 🔲 Partial | Translate works. Build: NoteCard styling, TranslationPanel, **"Add Note" dialog with Manual + Scan Photo tabs** |
| AI Weekly Summary | `/summary` | 🔲 Partial | Generate works. Build: SummaryCard, WeekBadge, EmptyState, **language selector + translate** |

---

## Demo Readiness

### V1 Checklist
- [ ] Dashboard loads patient card + 3 family avatars + task list
- [ ] Medication tracker shows 4 active meds with real dosages
- [ ] Doctor notes feed shows 3 notes with visible jargon
- [ ] "Explain in Tiếng Việt" → real Vietnamese translation in <8s
- [ ] Language selector switches between 10 languages
- [ ] "Generate This Week's Summary" → narrative summary appears
- [ ] Community resources page loads with Atlanta-area resources
- [ ] All pages load error-free at 1440px
- [ ] Deployed Vercel URL works end-to-end
- [ ] Demo script run 3x without error

### V2 Checklist
- [ ] User selection page shows 3 avatars + Add button
- [ ] Selecting user → dashboard shows "Logged in as [Name]"
- [ ] Task CRUD: create, edit, toggle complete, delete
- [ ] Medication checklist with live dose counts (2/2 ✓)
- [ ] "Confirm Given" on medication → logs who + when
- [ ] Photo scan: upload image → text extracted by Gemini
- [ ] Add Note from scan → note appears, ready to translate
- [ ] Summary translatable to Vietnamese/Spanish/etc.
- [ ] Activity feed shows attributed actions on dashboard
