import React, { useState, useEffect } from 'react'
import { Bell, Check, Clock, Pill, Calendar, X } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { listNotifications, markRead, type Notification } from '../data/notifications'
import { useToast } from '../components/Toast'

const Notifications = () => {
  const { user } = useSupabase()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await listNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
      showToast('error', 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (notification: Notification) => {
    if (notification.read) return

    try {
      await markRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      showToast('error', 'Failed to mark notification as read')
    }
  }

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    if (unreadNotifications.length === 0) return

    try {
      setMarkingAllRead(true)
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notification => markRead(notification.id))
      )
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      
      showToast('success', 'All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      showToast('error', 'Failed to mark all notifications as read')
    } finally {
      setMarkingAllRead(false)
    }
  }

  const getNotificationIcon = (kind?: string) => {
    switch (kind) {
      case 'reminder':
        return <Pill className="w-5 h-5 text-orange-600" />
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />
      default:
        return <Bell className="w-5 h-5 text-teal-600" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '428px', 
        margin: '0 auto',
        minHeight: 'calc(100vh - 80px)',
        background: '#fff',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        padding: '1rem'
      }}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '428px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      background: '#fff',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAllRead}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {markingAllRead ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Mark All Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h2>
            <p className="text-gray-600">You'll see activity updates and reminders here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkRead(notification)}
                className={`
                  bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all
                  ${notification.read 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-teal-200 bg-teal-50/30'
                  }
                  hover:shadow-md
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.kind)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`
                        font-semibold truncate
                        ${notification.read ? 'text-gray-700' : 'text-gray-900'}
                      `}>
                        {notification.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notification.created_at)}
                        </span>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    
                    {notification.body && (
                      <p className={`
                        text-sm leading-relaxed
                        ${notification.read ? 'text-gray-500' : 'text-gray-700'}
                      `}>
                        {notification.body}
                      </p>
                    )}
                    
                    {notification.kind && (
                      <div className="mt-2">
                        <span className={`
                          inline-block px-2 py-1 rounded-md text-xs font-medium
                          ${notification.kind === 'reminder' 
                            ? 'bg-orange-100 text-orange-700'
                            : notification.kind === 'appointment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                          }
                        `}>
                          {notification.kind.charAt(0).toUpperCase() + notification.kind.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">About Notifications</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Medication reminders appear when you mark doses as taken</li>
            <li>• Appointment notifications are created when you schedule visits</li>
            <li>• Tap any notification to mark it as read</li>
            <li>• Use "Mark All Read" to clear all unread notifications</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Notifications