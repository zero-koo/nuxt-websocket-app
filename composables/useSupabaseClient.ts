import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient> | null = null

export const useSupabaseClient = () => {
  if (supabase !== null) return supabase
  const {SUPABASE_URL, SUPABASE_KEY} = useRuntimeConfig().public

  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  return supabase
}