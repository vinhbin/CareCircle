# CareCircle — Build Progress

> Last updated: 2026-04-04

---

## Backend (Person C) — COMPLETE ✅

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

## Frontend — Person A

| Page | Route | Status | Notes |
|---|---|---|---|
| Dashboard | `/` | 🔲 Scaffold only | Needs PatientCard, FamilyAvatars, TaskSummary, MedCountBadge |
| Medication Tracker | `/medications` | 🔲 Scaffold only | Needs styled Table with active/inactive badges |

---

## Frontend — Person B

| Page | Route | Status | Notes |
|---|---|---|---|
| Doctor Notes | `/notes` | 🔲 Scaffold only | API wired up, translate works. Needs NoteCard, TranslationPanel styling |
| AI Weekly Summary | `/summary` | 🔲 Scaffold only | API wired up, generate works. Needs SummaryCard, WeekBadge, EmptyState |

---

## Shared

| Item | Status | Notes |
|---|---|---|
| Layout + Nav | 🔲 TODO | Top nav with logo, patient name, 5 nav links |
| Community Resources | 🔲 TODO | Static page at `/community` — no API needed |
| Color theme | 🔲 TODO | Rose/amber tones, not clinical blue |
| Loading states | 🔲 TODO | Skeletons, spinners |
| Responsive check | 🔲 TODO | All pages at 1440px |
| Vercel deploy | 🔲 TODO | Push to GitHub, add env vars |

---

## Demo Readiness

- [ ] Dashboard loads patient card + 3 family avatars + task list
- [ ] Medication table shows 4 active meds with real dosages
- [ ] Doctor notes feed shows 3 notes with visible jargon
- [ ] "Explain in Tiếng Việt" → real Vietnamese translation in <8s
- [ ] Language selector switches between 10 languages
- [ ] "Generate This Week's Summary" → narrative summary appears
- [ ] Community resources page loads with Atlanta-area resources
- [ ] All pages load error-free at 1440px
- [ ] Deployed Vercel URL works end-to-end
- [ ] Demo script run 3x without error
