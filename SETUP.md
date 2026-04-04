# CareCircle — Team Setup

Do these steps **in order** before splitting work.

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd carecircle
npm install
```

---

## 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all 3 values in `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page, "anon public" key |
| `GOOGLE_AI_API_KEY` | Google AI Studio → Get API Key |

**Never commit `.env.local`** — already in `.gitignore`.

---

## 3. Supabase Setup (one person does this, share the keys)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run the schema SQL from `CareCircle-Plan.md` (Phase 2)
3. Run the seed SQL from `CareCircle-Plan.md` (Phase 3)
4. **Disable RLS on every table** — Dashboard → Authentication → Policies → toggle off for each table. If you skip this, all queries silently return empty.
5. Confirm in Table Editor: `patients` has 1 row with `id = 1`

---

## 4. Add shadcn/ui

```bash
npx shadcn@latest init
```

When prompted: **Default** style · **Slate** color · **Yes** to CSS variables.

Then add components:

```bash
npx shadcn@latest add card badge button dialog table tabs avatar progress skeleton
```

For CRUD forms (add/edit medications, tasks, notes):

```bash
npx shadcn@latest add input textarea select label
```

Commit everything shadcn generates before anyone branches off.

---

## 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the CareCircle nav and stub pages pulling live Supabase data.

> Run this once before writing any API route handlers — Next.js generates TypeScript types on first run that the routes depend on.

---

## 6. Verify APIs are working

```bash
curl http://localhost:3000/api/family
curl http://localhost:3000/api/medications
curl http://localhost:3000/api/notes
curl http://localhost:3000/api/tasks
```

Each should return real Margaret data. If you get empty arrays, RLS is still on (Step 3).

---

## Who builds what

> **V2 update:** Person C pushes all backend + route changes before A and B pull.

| Person | Files |
|---|---|
| **A** | `src/app/dashboard/page.tsx` (task CRUD + activity feed), `src/app/medications/page.tsx` (checklist + dose tracking) |
| **B** | `src/app/notes/page.tsx` (Add Note dialog + photo scan), `src/app/summary/page.tsx` (translate) |
| **C** | All API routes, Gemini functions, user selection page, user context, Vercel deploy |

All API routes, user context, and Gemini functions are implemented by C. A and B build UI components against working APIs.
