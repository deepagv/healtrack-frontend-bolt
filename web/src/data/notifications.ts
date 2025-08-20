import { supabase } from '../lib/supabaseClient'

export interface Notification {
  id: string
  user_id: string
  title: string
  body?: string
  kind?: string
  read: boolean
  created_at: string
}

export async function listNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }
  
  return data || []
}

export async function markRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }
}

export async function createNotification(
  title: string,
  body?: string,
  kind?: string
): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title,
      body,
      kind
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }
  
  return data
}