import { supabase } from '../lib/supabaseClient'

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage?: string
  instructions?: string
  schedule?: any
  created_at: string
}

export interface MedicationLog {
  id: string
  user_id: string
  medication_id: string
  taken_at: string
  notes?: string
}

export async function listMeds(): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch medications: ${error.message}`)
  }
  
  return data || []
}

export async function addMed(
  name: string,
  dosage?: string,
  instructions?: string,
  scheduleJson?: any
): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .insert({
      name,
      dosage,
      instructions,
      schedule: scheduleJson
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to add medication: ${error.message}`)
  }
  
  return data
}

export async function logMed(
  medicationId: string,
  takenAt?: Date,
  notes?: string
): Promise<MedicationLog> {
  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      medication_id: medicationId,
      taken_at: takenAt?.toISOString() || new Date().toISOString(),
      notes
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to log medication: ${error.message}`)
  }
  
  return data
}

export async function getMedicationLogs(medicationId: string): Promise<MedicationLog[]> {
  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('medication_id', medicationId)
    .order('taken_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch medication logs: ${error.message}`)
  }
  
  return data || []
}