# CareCircle — Presentation Plan

> **Hackathon:** SHPE VIBRA ATL
> **Time limit:** 2 minutes
> **Judging:** Innovation (5) · Technical Execution (5) · Presentation (5) · Community Impact (5)

---

## The Story

This presentation is about **Bà Lan's family**, not about technology. The tech is the proof — the story is the pitch.

**Core tension:** A 19-year-old grandson should not be responsible for translating oncology notes in a language he barely understands.

**Resolution:** CareCircle gives every immigrant family a shared, multilingual care coordination tool — no login required, no English required.

---

## Script (2 minutes)

### Act 1: The Problem (30 seconds)

**[Show: User selection page — three family member avatars]**

> *"Meet Bà Lan. She's 70 years old. She immigrated from Vietnam three years ago. She has diabetes and high blood pressure. She speaks no English."*

**[Click: Kevin's avatar → dashboard loads]**

> *"Her grandson Kevin is 19. He works at Best Buy. Every time Bà Lan sees a doctor, Kevin gets handed a discharge note full of words like 'suboptimal glycemic control' and 'eGFR 61, CKD Stage 2' — and he's supposed to explain it to her. In Vietnamese. Using words he doesn't understand in English."*

**[Show: raw doctor note on screen — let the jargon speak for itself]**

---

### Act 2: The Solution (60 seconds)

**[Show: Doctor Notes page with raw jargon visible]**

> *"Here's what the doctor actually wrote. Now here's what CareCircle tells her family."*

**[Click: "Explain in Tiếng Việt" → Vietnamese translation appears]**

> *"Plain Vietnamese. Six seconds. No medical degree required."*

**[Switch language selector to Español]**

> *"Spanish for another family. Mandarin. Korean. Hindi. Ten languages, same six seconds."*

**[Navigate: Medications page — show checklist]**

> *"Bà Lan takes four medications a day. Her family tracks every dose — who gave it, when. Kevin confirmed her Metformin this morning."*

**[Show: dose count badge "2/2 ✓" and "Kevin, 8:32 AM"]**

**[Navigate: Doctor Notes → click "Add Doctor Note" → Scan Photo tab]**

> *"When the doctor hands Minh a paper discharge note, he takes a photo. CareCircle reads it — and explains it to the family in their language."*

**[Show: photo uploaded → text extracted → ready to translate]**

**[Navigate: Weekly Summary → show generated summary]**

> *"Every week, the whole family gets a summary of Bà Lan's care — in plain language. What happened, what to watch for, what to do next."*

**[Click: Translate to Tiếng Việt]**

> *"In Vietnamese, so Bà Lan can read it herself."*

---

### Act 3: The Impact (30 seconds)

**[Navigate: Community Resources page]**

> *"And when they need more help — free clinics, insurance, their legal right to an interpreter — it's all here."*

**[Show: "Your Right to an Interpreter" card]**

> *"38% of Hispanic adults have no regular doctor. 72% speak a language other than English at home. One misunderstood discharge note can mean a hospital readmission."*

> *"Kevin shouldn't have to be their interpreter. CareCircle is."*

---

## Feature Showcase Map

Every feature should be shown during the demo. Here's the checklist:

| Feature | When to show | Wow factor |
|---|---|---|
| **User selection** (no auth) | Act 1 — open the app | "No login wall — families don't need passwords" |
| **Dashboard + activity feed** | Act 1 — after selecting Kevin | "Every action tracked — who did what, when" |
| **Raw doctor notes** | Act 2 — before translation | Let the jargon create tension |
| **AI translation (Vietnamese)** | Act 2 — click translate | **Wow moment #1** — jargon → plain Vietnamese |
| **Language switching** | Act 2 — switch to Español | "Ten languages, same six seconds" |
| **Medication checklist + dose counts** | Act 2 — medications page | "Kevin confirmed Metformin at 8:32 AM" |
| **Photo scan** | Act 2 — scan tab | **Wow moment #2** — paper note → AI reads it |
| **AI weekly summary** | Act 2 — summary page | Family gets the full picture |
| **Summary translation** | Act 2 — translate summary | Bà Lan can read it herself |
| **Community resources** | Act 3 — community page | "Your legal right to an interpreter" |
| **Task management** | Background — visible on dashboard | Shows this is a real coordination tool |

---

## Scoring Strategy

### Innovation (target: 5/5)
- **Photo scan → AI medical translation** — no other caregiving app does this
- **Activity attribution without auth** — novel UX pattern
- **10-language medical translation** — not generic Google Translate, but jargon → plain language
- *Say:* "We're not translating words. We're translating understanding."

### Technical Execution (target: 5/5)
- **Gemini 2.5 Flash** — multimodal (OCR + text), translation, summarization
- **Supabase** — 9 tables, real seeded data, live queries
- **Next.js 16** — App Router, API routes, full-stack in one repo
- **Full CRUD** — not a slideshow, a working app
- *Say:* "Everything you're seeing is live. Real data, real AI, real-time."

### Presentation (target: 5/5)
- **Emotional hook:** Kevin's story — personal, relatable, specific
- **Show don't tell:** Let the jargon create tension, let the translation resolve it
- **Rehearsed flow:** Every click is planned, no fumbling
- **Strong close:** Stats + "Kevin shouldn't have to be their interpreter"
- *Say nothing:* Don't explain the tech stack during the demo. Show the product.

### Community Impact (target: 5/5)
- **38%** of Hispanic adults have no regular doctor
- **72%** speak a language other than English at home
- **Discharge note misunderstanding** = readmission = cost = suffering
- **Interpreter rights** — most families don't know this is federal law
- **Atlanta-specific resources** — FQHCs, Grady, AAAJ-Atlanta, Latin American Association
- *Say:* "This isn't hypothetical. This is happening in Atlanta, right now, to families in this room."

---

## Presentation Tips

1. **One person tells the story, one person drives the demo.** Don't split narration.
2. **Never say "and then we built..."** — say what the product does, not how you built it.
3. **Let silence work.** After showing the Vietnamese translation, pause. Let judges read it.
4. **Make eye contact during the stats.** The numbers hit harder when delivered to people, not a screen.
5. **End on Kevin, not on tech.** The last word should be about the family, not the stack.

---

## Pre-Demo Checklist

- [ ] Vercel URL deployed and working
- [ ] All 3 family members visible on user selection page
- [ ] Kevin selected → dashboard loads with activity feed
- [ ] Doctor notes page has 3 notes with visible jargon
- [ ] "Explain in Tiếng Việt" returns real Vietnamese in <8s
- [ ] Language selector works for at least 3 languages live
- [ ] Medications page shows checklist with dose counts
- [ ] "Add Doctor Note" → Scan Photo tab → upload test image → text extracted
- [ ] Weekly summary generates and translates
- [ ] Community resources page loads with working links
- [ ] Demo run 3x without errors
- [ ] Presenter can tell Bà Lan's story without reading from notes
- [ ] Timer confirms demo fits in 2 minutes
