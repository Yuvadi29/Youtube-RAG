import { createClient } from '@supabase/supabase-js'

export const createSupabaseClient = () => {
  let supabaseUrl = process.env.SUPABASE_URL

  let supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  return createClient(supabaseUrl, supabaseAnonKey)
}
