import React, { useState, useEffect } from 'react'
import { Pill, Plus, Clock, Check, X, Bell } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { listMeds, addMed, logMed, type Medication } from '../data/medications'
import { createNotification } from '../data/notifications'
import { useToast } from '../components/Toast'

import { z } from 'zod'

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
  scheduleType: z.enum(['daily', 'weekly', 'as_needed']),
  times: z.array(z.string()).min(1, 'At least one time is required for scheduled medications')
})

const Medications = () => {
  const { user } = useSupabase()
  const { showToast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [createForm, setCreateForm] = useState({
    name: '',
    dosage: '',
    instructions: '',
    scheduleType: 'daily' as 'daily' | 'weekly' | 'as_needed',
    times: ['08:00']
  })

  useEffect(() => {
    if (user) {
      loadMedications()
    }
  }, [user])

  const loadMedications = async () => {
    try {
      setLoading(true)
      const data = await listMeds()
      setMedications(data)
    } catch (error) {
      console.error('Error loading medications:', error)
      showToast('error', 'Failed to load medications')
    } finally {
      setLoading(false)
    }
  }

  const getNextDueTime = (schedule: any): string | null => {
    if (!schedule || schedule.type !== 'daily' || !schedule.times) {
      return null
    }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    for (const timeStr of schedule.times) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const scheduleTime = hours * 60 + minutes

      if (scheduleTime > currentTime) {
        return timeStr
      }
    }

    // If no time today, return first time tomorrow
    return schedule.times[0] + ' (tomorrow)'
  }

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form with zod
    const validation = medicationSchema.safeParse({
      ...createForm,
      times: createForm.scheduleType === 'as_needed' ? ['00:00'] : createForm.times.filter(time => time.trim())
    })

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
      const schedule = createForm.scheduleType === 'as_needed' 
        ? { type: 'as_needed' }
        : {
            type: createForm.scheduleType,
            times: createForm.times.filter(time => time.trim())
          }

      await addMed(
        createForm.name.trim(),
        createForm.dosage.trim() || undefined,
        createForm.instructions.trim() || undefined,
        schedule
      )

      showToast('success', 'Medication added successfully')
      setShowCreateModal(false)
      setCreateForm({
        name: '',
        dosage: '',
        instructions: '',
        scheduleType: 'daily',
        times: ['08:00']
      })
      
      loadMedications()
    } catch (error) {
      console.error('Error creating medication:', error)
      showToast('error', 'Failed to add medication')
    }
  }

  const handleMarkTaken = async (medication: Medication) => {
    try {
      const now = new Date()
      
      // Log the medication
      await logMed(medication.id, now)
      
      // Create notification
      await createNotification(
        'Medication taken',
        `${medication.name} taken at ${now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        'reminder'
      )

      showToast('success', `${medication.name} marked as taken`)
    } catch (error) {
      console.error('Error marking medication as taken:', error)
      showToast('error', 'Failed to mark medication as taken')
    }
  }

  const addTimeSlot = () => {
    setCreateForm({
      ...createForm,
      times: [...createForm.times, '12:00']
    })
  }

  const updateTimeSlot = (index: number, time: string) => {
    const newTimes = [...createForm.times]
    newTimes[index] = time
    setCreateForm({ ...createForm, times: newTimes })
  }

  const removeTimeSlot = (index: number) => {
    if (createForm.times.length > 1) {
      const newTimes = createForm.times.filter((_, i) => i !== index)
      setCreateForm({ ...createForm, times: newTimes })
    }
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
            <h1 className="text-h2 font-semibold text-foreground">Medications</h1>
            <p className="text-caption text-muted-foreground">Manage your prescriptions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="p-4">

        {medications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-12">
            <div>
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-h3 font-semibold text-foreground mb-2">No medications added yet</h2>
              <p className="text-body text-muted-foreground mb-4">Add your medications to track dosages and get reminders</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-button hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Medication
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => {
              const nextDue = getNextDueTime(medication.schedule)
              
              return (
                <div key={medication.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div key={medication.id} className="bg-card rounded-card border border-border p-4 shadow-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-body font-semibold text-foreground">{medication.name}</h3>
                        {medication.dosage && (
                          <p className="text-caption text-muted-foreground">{medication.dosage}</p>
                        )}
                      </div>
                    </div>
                    
                    {nextDue && (
                      <div className="flex items-center gap-2">
                        <div className="bg-warning/10 text-warning px-2 py-1 rounded-md text-caption font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {nextDue}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {medication.instructions && (
                    <p className="text-body text-muted-foreground mb-3">{medication.instructions}</p>
                  )}
                  
                  {medication.schedule && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Schedule:</div>
                      {medication.schedule.type === 'daily' && medication.schedule.times ? (
                        <div className="flex flex-wrap gap-1">
                          {medication.schedule.times.map((time: string, index: number) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {time}
                            </span>
                          ))}
                        </div>
                      ) : medication.schedule.type === 'as_needed' ? (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          As needed
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {medication.schedule.type}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkTaken(medication)}
                      className="flex-1 bg-success text-white py-2 px-4 rounded-button hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark Taken
                    </button>
                    <button className="px-3 py-2 border border-border text-foreground rounded-button hover:bg-surface-subtle transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create Medication Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h2 font-semibold text-foreground">Add Medication</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateMedication} className="space-y-4">
                <div>
                  <label htmlFor="med-name" className="block text-body font-medium text-foreground mb-2">
                    Medication Name *
                  </label>
                  <input
                    id="med-name"
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Metformin"
                    className="w-full h-12 px-3 border border-border rounded-button bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-caption text-danger mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="med-dosage" className="block text-body font-medium text-foreground mb-2">
                    Dosage
                  </label>
                  <input
                    id="med-dosage"
                    type="text"
                    value={createForm.dosage}
                    onChange={(e) => setCreateForm({ ...createForm, dosage: e.target.value })}
                    placeholder="e.g., 500mg"
                    className="w-full h-12 px-3 border border-border rounded-button bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="med-instructions" className="block text-body font-medium text-foreground mb-2">
                    Instructions
                  </label>
                  <textarea
                    id="med-instructions"
                    value={createForm.instructions}
                    onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                    placeholder="e.g., Take with food"
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-button bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="med-schedule" className="block text-body font-medium text-foreground mb-2">
                    Schedule Type
                  </label>
                  <select
                    id="med-schedule"
                    value={createForm.scheduleType}
                    onChange={(e) => setCreateForm({ 
                      ...createForm, 
                      scheduleType: e.target.value as 'daily' | 'weekly' | 'as_needed',
                      times: e.target.value === 'as_needed' ? [] : ['08:00']
                    })}
                    className="w-full h-12 px-3 border border-border rounded-button bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                {createForm.scheduleType !== 'as_needed' && (
                  <div>
                    <label className="block text-body font-medium text-foreground mb-2">
                      Times
                    </label>
                    {formErrors.times && (
                      <p className="text-caption text-danger mb-2">{formErrors.times}</p>
                    )}
                    <div className="space-y-2">
                      {createForm.times.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => updateTimeSlot(index, e.target.value)}
                            className="flex-1 h-12 px-3 border border-border rounded-button bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          />
                          {createForm.times.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="px-2 py-2 text-danger hover:bg-danger/10 rounded-button transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTimeSlot}
                        className="w-full h-12 border border-dashed border-border text-muted-foreground rounded-button hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Time
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 h-12 px-4 border border-border text-foreground rounded-button hover:bg-surface-subtle transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 bg-primary-600 text-white px-4 rounded-button hover:bg-primary-700 transition-colors"
                  >
                    Add Medication
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

export default Medications