import { supabase } from '../lib/supabaseClient'

export interface Profile {
  id: string
  full_name?: string
  avatar_url?: string
  gender?: string
  dob?: string
  height_cm?: number
  weight_kg?: number
  updated_at: string
}

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null
    }
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }
  
  return data
}

export async function createProfile(profileData: Partial<Profile>): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`)
  }
  
  return data
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
  
  return data
}

export async function deleteProfile(): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
  
  if (error) {
    throw new Error(`Failed to delete profile: ${error.message}`)
  }
}