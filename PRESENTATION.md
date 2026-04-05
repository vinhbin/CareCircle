# CareCircle — Presentation Plan

> **Hackathon:** SHPE VIBRA ATL
> **Time limit:** 2 minutes
> **Judging:** Innovation (5) · Technical Execution (5) · Presentation (5) · Community Impact (5)

---

## The Story

This presentation is about **families who can't read their own medical records**, not about technology. The tech is the proof — the story is the pitch.

**Core tension:** 25 million Americans have limited English proficiency. When they leave the doctor's office, they get a discharge note full of words they cannot read — and no one to explain it.

**Resolution:** CareCircle gives every family a shared, multilingual care coordination tool — no login required, no English required.

---

## Script (2 minutes)

### Act 1: The Problem (25 seconds)

**[Show: User selection page — three family member avatars]**

> *"Meet Bà Lan. She's 70 years old. She immigrated from Vietnam three years ago. She has diabetes and high blood pressure. She speaks no English."*

**[Click: Kevin's avatar → dashboard loads]**

> *"Her grandson Kevin is 19. Every time Bà Lan sees a doctor, Kevin gets handed a discharge note full of words like 'suboptimal glycemic control' and 'eGFR 61, CKD Stage 2' — and he's supposed to explain it to her. In Vietnamese."*

---

### Act 2: The Solution (65 seconds)

**[Navigate: Doctor Notes page — show raw jargon]**

> *"Here's what the doctor actually wrote. Now here's what CareCircle tells her family."*

**[Click: "Translate" → Vietnamese translation appears]**

*[Pause 3 seconds — let judges read]*

> *"Plain Vietnamese. Six seconds. No medical degree required. Works in ten languages."*

**[Navigate: Doctor Notes → click "Add Note" → show all three tabs]**

> *"When the doctor hands them a paper note — take a photo, AI reads it. Coming from an appointment? Record a voice memo, AI transcribes it. Three ways in, all of them end in a note the whole family can translate and understand."*

**[Navigate: Medications page — show dose tracker]**

> *"Bà Lan takes four medications a day. The family tracks every dose — who gave it, when. If someone tries to give a second dose, the app warns them before it becomes dangerous."*

**[Navigate: Weekly Summary → show generated summary]**

> *"Every week, the AI reviews everything — medications, notes, tasks — and writes a summary. What happened, what to watch for, what to do next."*

**[Click: Translate to Vietnamese]**

> *"In Vietnamese, so Bà Lan can read it herself."*

**[Navigate: Documents page — show folder grid]**

> *"Every medical document — lab results, prescriptions, insurance cards — uploaded once, classified by AI, organized into folders automatically."*

---

### Act 3: The Impact (30 seconds)

**[Navigate: Dashboard → click Emergency QR Card button → open emergency card]**

> *"And if Bà Lan goes to the ER and no family member is there — she carries this QR code. Paramedic scans it: her name, her allergies, her medications, her language, her emergency contact. No app download. No login. Just scan."*

**[Navigate: Community Resources page — show "Know Your Rights" banner]**

> *"Most immigrant families don't know this: any hospital receiving federal funding is required by law to provide a free interpreter. You never need to use a family member. CareCircle tells them."*

> *"25 million Americans have limited English. One in five can't read their own discharge note. Kevin shouldn't have to be his grandmother's medical interpreter. CareCircle is."*

---

## Feature Showcase Map

Every feature should be shown during the demo:

| Feature | When to show | Wow factor |
|---|---|---|
| **User selection** (no auth) | Act 1 — open the app | "No login wall — families don't need passwords" |
| **Dashboard + activity feed** | Act 1 — after selecting Kevin | "Every action tracked — who did what, when" |
| **Raw doctor notes** | Act 2 — before translation | Let the jargon create tension |
| **AI translation (Vietnamese)** | Act 2 — click translate | **Wow moment #1** — jargon to plain Vietnamese |
| **Language switching** | Act 2 — mention ten languages | "Works in ten languages" |
| **Photo scan (AI OCR)** | Act 2 — Add Note dialog | **Wow moment #2** — paper note to digital text |
| **Voice memo (AI transcription)** | Act 2 — Add Note dialog | "Record and transcribe with AI" |
| **Medication tracker + overdose warning** | Act 2 — medications page | "Warns before a dangerous second dose" |
| **AI weekly summary** | Act 2 — summary page | AI reviews the whole week |
| **Summary translation** | Act 2 — translate summary | "Bà Lan reads it herself" |
| **Medical binder (AI classification)** | Act 2 — documents page | "Uploaded once, classified by AI" |
| **Emergency QR card** | Act 3 — dashboard button | **Wow moment #3** — scannable by any paramedic |
| **Community resources + interpreter rights** | Act 3 — community page | "Federal law — most families don't know" |
| **Interactive guided tour** | Background — visible in header | Shows polish and onboarding |
| **Task management** | Background — visible on dashboard | Shows real coordination tool |

---

## Scoring Strategy

### Innovation (target: 5/5)
- **Photo scan + voice memo to AI medical translation** — no other caregiving app does this pipeline
- **Emergency QR card** — zero-login emergency access for first responders
- **AI document classification** — upload a photo, AI files it into the right folder
- **Activity attribution without auth** — novel UX pattern for family coordination
- **10-language medical translation** — not generic translation, but jargon to plain language with action items
- *Say:* "We're not translating words. We're translating understanding."

### Technical Execution (target: 5/5)
- **Gemini 2.5 Flash** — multimodal AI: OCR, voice transcription, translation, summarization, document classification
- **Supabase** — 9 tables, real seeded data, live queries, private document storage with signed URLs
- **Next.js 16** — App Router, 12 API routes, full-stack in one repo
- **Full CRUD** — tasks, medications, notes, documents — not a slideshow, a working app
- **Interactive guided tour** — driver.js-powered onboarding built into every page
- *Say:* "Everything you're seeing is live. Real data, real AI, real-time."

### Presentation (target: 5/5)
- **Emotional hook:** Kevin's story — personal, relatable, specific
- **Show don't tell:** Let the jargon create tension, let the translation resolve it
- **Three wow moments:** Translation, photo scan, emergency QR card
- **Strong close:** Stats + "Kevin shouldn't have to be their interpreter"
- *Say nothing:* Don't explain the tech stack during the demo. Show the product.

### Community Impact (target: 5/5)
- **25 million** Americans have limited English proficiency (LEP)
- **1 in 5** LEP patients cannot read their own discharge notes
- **35%** of LEP patients experience an adverse event caused by communication errors
- **Discharge note misunderstanding** = readmission = cost = suffering
- **Interpreter rights** — most families don't know free interpreters are federal law (Title VI)
- **Atlanta-specific resources** — FQHCs, Grady, AAAJ-Atlanta, Latin American Association, New American Pathways
- *Say:* "This isn't hypothetical. This is happening in Atlanta, right now, to families in this room."

---

## Presentation Tips

1. **One person tells the story, one person drives the demo.** Don't split narration.
2. **Never say "and then we built..."** — say what the product does, not how you built it.
3. **Let silence work.** After showing the Vietnamese translation, pause. Let judges read it.
4. **Make eye contact during the stats.** The numbers hit harder when delivered to people, not a screen.
5. **End on Kevin, not on tech.** The last word should be about the family, not the stack.
6. **Use the guided tour if judges ask for a walkthrough.** It's built in — click the Tour button in the header.

---

## Pre-Demo Checklist

- [ ] Vercel URL deployed and working
- [ ] All 3 family members visible on user selection page
- [ ] Kevin selected → dashboard loads with activity feed
- [ ] Doctor notes page has 3 notes with visible jargon
- [ ] Translation returns real Vietnamese in <8s
- [ ] Language selector works for at least 3 languages live
- [ ] Add Note dialog → all 3 tabs visible (Manual, Scan Photo, Voice Memo)
- [ ] Photo scan: test image → text extracted
- [ ] Medications page shows dose tracker with progress bars
- [ ] Weekly summary pre-generated and translatable
- [ ] Documents page shows folder grid with at least 1 document
- [ ] Emergency QR Card button → QR dialog → emergency card opens
- [ ] Community resources page loads with "Know Your Rights" banner visible
- [ ] Guided tour button works on dashboard (click Tour in header)
- [ ] Demo run 3x without errors
- [ ] Presenter can tell the story without reading from notes
- [ ] Timer confirms demo fits in 2 minutes
