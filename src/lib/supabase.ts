// SUPABASE CLIENT — singleton used by all API routes
// Connects to hosted Postgres via env vars in .env.local
// RLS must be disabled on all tables or queries silently return empty

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
