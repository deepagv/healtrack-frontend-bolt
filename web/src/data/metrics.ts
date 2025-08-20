import { supabase } from '../lib/supabaseClient'

export interface HealthMetric {
  id: string
  user_id: string
  kind: 'steps' | 'water' | 'weight' | 'heart_rate' | 'sleep' | 'calories'
  value: number
  unit?: string
  notes?: string
  recorded_at: string
  created_at: string
}

export async function listMetrics(
  kind: HealthMetric['kind'], 
  options: { limit?: number; days?: number } = {}
): Promise<HealthMetric[]> {
  const { limit = 100, days = 7 } = options
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('kind', kind)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    throw new Error(`Failed to fetch ${kind} metrics: ${error.message}`)
  }
  
  return data || []
}

export async function addMetric(
  kind: HealthMetric['kind'],
  value: number,
  unit?: string,
  notes?: string,
  recordedAt?: Date
): Promise<HealthMetric> {
  const { data, error } = await supabase
    .from('health_metrics')
    .insert({
      kind,
      value,
      unit,
      notes,
      recorded_at: recordedAt?.toISOString() || new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to add ${kind} metric: ${error.message}`)
  }
  
  return data
}

export async function getLatestMetrics(): Promise<Record<HealthMetric['kind'], HealthMetric | null>> {
  const kinds: HealthMetric['kind'][] = ['steps', 'water', 'weight', 'heart_rate', 'sleep', 'calories']
  
  const results = await Promise.all(
    kinds.map(async (kind) => {
      const metrics = await listMetrics(kind, { limit: 1 })
      return { kind, metric: metrics[0] || null }
    })
  )
  
  return results.reduce((acc, { kind, metric }) => {
    acc[kind] = metric
    return acc
  }, {} as Record<HealthMetric['kind'], HealthMetric | null>)
}