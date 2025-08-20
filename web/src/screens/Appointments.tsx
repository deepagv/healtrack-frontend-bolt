import React, { useState, useEffect } from 'react'
import { Calendar, Plus, MapPin, Clock, Edit, Trash2, X } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { listAppointments, createAppointment, updateAppointment, deleteAppointment, type Appointment } from '../data/appointments'
import { createNotification } from '../data/notifications'
import { useToast } from '../components/Toast'

import { z } from 'zod'

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  location: z.string().optional(),
  startsAt: z.string().min(1, 'Start date and time is required'),
  endsAt: z.string().optional(),
  notes: z.string().optional()
})

const Appointments = () => {
  const { user } = useSupabase()
  const { showToast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    startsAt: '',
    endsAt: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const data = await listAppointments()
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
      showToast('error', 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      startsAt: '',
      endsAt: '',
      notes: ''
    })
    setEditingAppointment(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (appointment: Appointment) => {
    setFormData({
      title: appointment.title,
      location: appointment.location || '',
      startsAt: new Date(appointment.starts_at).toISOString().slice(0, 16),
      endsAt: appointment.ends_at ? new Date(appointment.ends_at).toISOString().slice(0, 16) : '',
      notes: appointment.notes || ''
    })
    setEditingAppointment(appointment)
    setShowCreateModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form with zod
    const validation = appointmentSchema.safeParse(formData)

    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.errors.forEach(error => {
        errors[error.path[0] as string] = error.message
      })
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    try {
      const startsAt = new Date(formData.startsAt)
      const endsAt = formData.endsAt ? new Date(formData.endsAt) : undefined

      if (editingAppointment) {
        // Update existing appointment
        await updateAppointment(editingAppointment.id, {
          title: formData.title.trim(),
          location: formData.location.trim() || undefined,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt?.toISOString(),
          notes: formData.notes.trim() || undefined
        })
        showToast('success', 'Appointment updated successfully')
      } else {
        // Create new appointment
        await createAppointment(
          formData.title.trim(),
          startsAt,
          formData.location.trim() || undefined,
          endsAt,
          formData.notes.trim() || undefined
        )

        // Create notification
        await createNotification(
          'Appointment added',
          `${formData.title} scheduled for ${startsAt.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })} at ${startsAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          'appointment'
        )

        showToast('success', 'Appointment created successfully')
      }
      
      setShowCreateModal(false)
      resetForm()
      loadAppointments()
    } catch (error) {
      console.error('Error saving appointment:', error)
      showToast('error', 'Failed to save appointment')
    }
  }

  const handleDelete = async (appointment: Appointment) => {
    if (!confirm(`Delete "${appointment.title}"?`)) {
      return
    }

    try {
      await deleteAppointment(appointment.id)
      showToast('success', 'Appointment deleted')
      loadAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      showToast('error', 'Failed to delete appointment')
    }
  }

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = new Date(appointment.starts_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(appointment)
    return groups
  }, {} as Record<string, Appointment[]>)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-semibold text-foreground">Appointments</h1>
            <p className="text-caption text-muted-foreground">Manage your healthcare schedule</p>
          </div>
          <button
            onClick={openCreateModal}
            className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="p-4">

        {Object.keys(groupedAppointments).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No appointments scheduled</h2>
            <p className="text-gray-600 mb-4">Schedule your healthcare appointments and get reminders</p>
            <button
              onClick={openCreateModal}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Schedule Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAppointments)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([dateString, dayAppointments]) => (
                <div key={dateString}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    {formatDate(dateString)}
                  </h2>
                  
                  <div className="space-y-3">
                    {dayAppointments
                      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
                      .map((appointment) => (
                        <div key={appointment.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{appointment.title}</h3>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(appointment.starts_at)}
                                  {appointment.ends_at && (
                                    <span> - {formatTime(appointment.ends_at)}</span>
                                  )}
                                </div>
                                
                                {appointment.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {appointment.location}
                                  </div>
                                )}
                              </div>
                              
                              {appointment.notes && (
                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                              )}
                            </div>
                            
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => openEditModal(appointment)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(appointment)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Create/Edit Appointment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="appt-title" className="block text-body font-medium text-foreground mb-2">
                    Title *
                  </label>
                  <input
                    id="appt-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Dr. Smith - Checkup"
                    className="w-full h-12 px-3 border border-border rounded-button bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    required
                  />
                  {formErrors.title && (
                    <p className="text-caption text-danger mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Downtown Medical Center"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or instructions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                  >
                    {editingAppointment ? 'Update' : 'Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
      </div>
    </div>
  )
}