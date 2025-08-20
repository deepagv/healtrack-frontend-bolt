import { supabase } from '../lib/supabaseClient'

export interface Appointment {
  id: string
  user_id: string
  title: string
  location?: string
  starts_at: string
  ends_at?: string
  notes?: string
  created_at: string
}

export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('starts_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`)
  }
  
  return data || []
}

export async function createAppointment(
  title: string,
  startsAt: Date,
  location?: string,
  endsAt?: Date,
  notes?: string
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      title,
      location,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt?.toISOString(),
      notes
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create appointment: ${error.message}`)
  }
  
  return data
}

export async function updateAppointment(
  id: string,
  updates: Partial<Pick<Appointment, 'title' | 'location' | 'starts_at' | 'ends_at' | 'notes'>>
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update appointment: ${error.message}`)
  }
  
  return data
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete appointment: ${error.message}`)
  }
}