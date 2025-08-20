import { useAuth } from '../auth/AuthProvider'
import { supabase } from '../lib/supabaseClient'

export function useSupabase() {
  const { user } = useAuth()
  
  return {
    supabase,
    user
  }
}