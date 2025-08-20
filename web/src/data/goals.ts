import { supabase } from '../lib/supabaseClient'

export interface Goal {
  id: string
  user_id: string
  kind: 'steps' | 'water' | 'weight' | 'heart_rate' | 'sleep' | 'calories'
  target: number
  unit?: string
  period: 'daily' | 'weekly' | 'monthly'
  starts_on: string
  created_at: string
  updated_at: string
}

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch goals: ${error.message}`)
  }
  
  return data || []
}

export async function createGoal(
  kind: Goal['kind'],
  target: number,
  unit?: string,
  period: Goal['period'] = 'daily'
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      kind,
      target,
      unit,
      period
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create goal: ${error.message}`)
  }
  
  return data
}

export async function updateGoal(
  id: string,
  updates: Partial<Pick<Goal, 'target' | 'unit' | 'period'>>
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update goal: ${error.message}`)
  }
  
  return data
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete goal: ${error.message}`)
  }
}