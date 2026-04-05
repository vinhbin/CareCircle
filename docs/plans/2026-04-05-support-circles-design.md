# Support Circles — Peer Support Threading Feature

> Validated 2026-04-05. Hardcoded static page — no API needed.

---

## Concept

Peer-to-peer Q&A threads organized by diagnosis. Patients ask questions and get advice from others living with the same condition. Every post auto-displays in the reader's language with an "Originally in [language]" badge. Similar to circle therapy — a safe space for patients to connect.

**Primary user:** The patient (e.g., Bà Lan connecting with other diabetes patients).

**Translation model:** All posts auto-rendered in English (the reader's language) with "Originally in Vietnamese" labels. Hardcoded — we write the "translated" English text directly alongside the original language label.

**Demo strategy:** One richly populated Diabetes Type 2 circle (4 questions, 8+ replies). Two other circles (Hypertension, CKD) shown on landing page with low counts to imply scale.

---

## Route & Navigation

- **Route:** `/circles`
- **Page:** `src/app/circles/page.tsx` — client component, zero API calls, all data inline
- **Nav item:** "Circles" inserted between Documents and Community in `src/components/app-shell.tsx`
- **Icon:** `MessageCircle` from lucide-react (fits the "circle therapy" metaphor)
- **Nav order:** Dashboard · Medications · Doctor Notes · Weekly Summary · Documents · **Circles** · Community

### Nav changes (`src/components/app-shell.tsx`)

Add to imports:
```tsx
import { MessageCircle } from 'lucide-react'
```

Add to `navItems` array (before Community):
```tsx
{ path: '/circles', label: 'Circles', icon: MessageCircle },
```

Mobile bottom nav: `navItems.slice(0, 5)` stays the same — Circles won't crowd the mobile bar (accessible via hamburger menu on mobile).

---

## Landing Page — Circle Cards

Grid of diagnosis circle cards following the **document folder grid** pattern.

### Layout

```
max-w-6xl mx-auto pb-20 lg:pb-8
```

**Header:**
```
h1: "Support Circles" — text-3xl font-semibold text-[#0f172a] mb-2
subtitle: "Connect with patients who understand your journey" — text-[#64748b]
```

**Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

### Circle Cards

Same card pattern as document folders:
- `rounded-2xl border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all`
- `size-14 rounded-2xl` icon pill with diagnosis-specific colors
- Metadata: member count + question count in `text-sm text-[#64748b]`
- `ChevronRight` at bottom-right

| Circle | Icon | Pill bg | Pill text | Members | Questions |
|--------|------|---------|-----------|---------|-----------|
| Diabetes Type 2 | `Droplets` | `bg-[#fef3c7]` | `text-[#f59e0b]` | 128 members | 4 questions |
| Hypertension | `HeartPulse` | `bg-[#ffe4e6]` | `text-[#f43f5e]` | 85 members | 2 questions |
| Chronic Kidney Disease | `Activity` | `bg-[#ede9fe]` | `text-[#8b5cf6]` | 42 members | 1 question |

Each card also shows a warm one-line description:
- Diabetes: "Share tips for managing blood sugar, diet, and daily life"
- Hypertension: "Connect with others managing high blood pressure"
- CKD: "Support for chronic kidney disease patients and families"

---

## Thread View — Inside a Circle

Clicking a circle card sets state to show the thread view (same single-page pattern as document folders — no separate route).

### Breadcrumb

Same pattern as Medical Binder:
```tsx
<button onClick={() => setOpenCircle(null)}>
  Support Circles <ChevronRight /> <span className="font-medium">Diabetes Type 2</span>
</button>
```
Style: `text-[#64748b] hover:text-[#f43f5e] transition-colors`

### Circle Header Card

```
rounded-2xl border-[#f43f5e]/10 shadow-sm shadow-[#f43f5e]/5
```

Contains:
- Diagnosis name (text-2xl font-semibold)
- Description
- Member count badge
- Language cluster: row of language pills using `LANGUAGE_COLORS` from community page pattern (Vietnamese, Spanish, English, Hindi) with `Globe` icon

### Question Cards

```
rounded-2xl border-gray-200 shadow-sm border-l-4 border-[#f43f5e]
```

Each question shows:
- **Avatar** — `size-10 rounded-full` with `AvatarFallback` using `memberColor()` hash (same as dashboard)
- **Name** — `font-semibold text-[#0f172a]`
- **Language badge** — "Originally in Vietnamese" using `LANGUAGE_COLORS` map + `Globe` icon
- **Timestamp** — `text-sm text-[#64748b]` (relative: "2 days ago")
- **Body** — `text-[#0f172a] leading-relaxed`
- **Helpful count** — `Heart` icon + static number, `text-sm text-[#64748b]`

### Reply Cards

Indented under questions:
- `ml-12` with `border-l-2 border-[#e2e8f0]` connector
- Same avatar + name + language badge pattern, slightly smaller (`size-8`)
- No left border accent (only questions get rose accent)
- Same helpful count pattern

### Ask a Question Placeholder

At bottom of thread:
```tsx
<Input
  disabled
  placeholder="Share your experience or ask a question..."
  className="rounded-xl h-12"
/>
```
Non-functional — shows intent for demo.

---

## Hardcoded Thread Content

### Diabetes Type 2 Circle — 4 Questions

**Q1: "How do you manage blood sugar spikes after meals?"**
- Author: Bà Lan N. | Originally in: Vietnamese | 2 days ago | 12 helpful
- Reply 1: Maria G. | Originally in: Spanish | 1 day ago | 8 helpful
  - "I walk for 15 minutes after every meal. My doctor said even a short walk helps your body use the sugar. It's become my favorite part of the day — I listen to music and it doesn't feel like exercise."
- Reply 2: James O. | Originally in: English | 1 day ago | 5 helpful
  - "Portion control was the game changer for me. I use a smaller plate now and fill half with vegetables. My A1C dropped from 8.2 to 6.9 in three months."

**Q2: "My doctor changed my metformin dose and I feel dizzy — is this normal?"**
- Author: Maria G. | Originally in: Spanish | 3 days ago | 15 helpful
- Reply 1: Bà Lan N. | Originally in: Vietnamese | 2 days ago | 11 helpful
  - "I had the same thing when my dose went up. My grandson called the doctor and they said to take it with food. After a week the dizziness went away. Don't skip meals when you take it."
- Reply 2: Priya S. | Originally in: Hindi | 2 days ago | 7 helpful
  - "This happened to me too. Make sure you're drinking enough water. My doctor also checked my blood pressure because dizziness can mean it dropped too low. Worth asking about."

**Q3: "What foods do you cook that are good for diabetes?"**
- Author: James O. | Originally in: English | 5 days ago | 18 helpful
- Reply 1: Bà Lan N. | Originally in: Vietnamese | 4 days ago | 14 helpful
  - "I make phở with less noodles and more vegetables now. My grandson found a recipe that uses zucchini noodles instead. It's not the same but it's close, and my blood sugar stays much better."
- Reply 2: Maria G. | Originally in: Spanish | 4 days ago | 9 helpful
  - "Bean soups are wonderful — black beans, lentils. They fill you up and don't spike your sugar. I also switched to whole wheat tortillas. Small changes add up."
- Reply 3: Priya S. | Originally in: Hindi | 3 days ago | 6 helpful
  - "Bitter gourd (karela) is traditional in my family for diabetes. I know it's an acquired taste but there are ways to cook it that aren't so bitter. I can share recipes if anyone wants."

**Q4: "How do you explain your condition to family who don't understand?"**
- Author: Priya S. | Originally in: Hindi | 1 week ago | 22 helpful
- Reply 1: James O. | Originally in: English | 6 days ago | 10 helpful
  - "I told my kids: 'My body has trouble using sugar for energy, so I have to be careful about what I eat and take medicine to help.' Keeping it simple worked better than medical terms."
- Reply 2: Bà Lan N. | Originally in: Vietnamese | 6 days ago | 16 helpful
  - "My grandson Kevin helps me explain to the family. He translates the doctor's words into things everyone understands. Having someone who speaks both languages — medical and family — makes all the difference."

### Hypertension Circle (minimal — landing card only)

- Q1: "Does anyone else get headaches when their pressure is high?" — 4 helpful
- Q2: "How do you remember to take your medicine every day?" — 7 helpful

### CKD Circle (minimal — landing card only)

- Q1: "What diet changes helped your kidney numbers?" — 6 helpful

---

## Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Hardcoded data | Static, no API | Zero failure points in demo, same as emergency card |
| Auto-translation | Pre-written English with "Originally in" labels | Reuses translation narrative without needing live AI calls |
| One rich circle | Diabetes Type 2 fully populated | Demo time only allows clicking into one circle |
| Q&A format | Questions + threaded replies | Best visual hierarchy, shows community engagement |
| Folder navigation pattern | Same as Medical Binder | Consistent UX, judges recognize the pattern |
| Non-functional input | Placeholder "Ask a question" | Shows product intent without needing backend |

---

## Implementation Checklist

- [ ] Create `src/app/circles/page.tsx` with all hardcoded data
- [ ] Add nav item to `src/components/app-shell.tsx` (import MessageCircle, add to navItems)
- [ ] Landing page: circle cards grid with diagnosis icons, member/question counts
- [ ] Thread view: breadcrumb, circle header, question cards with replies
- [ ] Avatar colors using memberColor() hash pattern
- [ ] Language badges using LANGUAGE_COLORS pattern from community page
- [ ] Staggered fade-in animations on cards
- [ ] "Ask a question" placeholder input at bottom
- [ ] Test on mobile and desktop layouts
