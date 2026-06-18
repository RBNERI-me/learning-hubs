import { createClient } from '@supabase/supabase-js';

export type SupabaseClient = ReturnType<typeof createClient>;

export function getClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }
  return createClient(url, key);
}
