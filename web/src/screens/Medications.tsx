import React, { useState, useEffect } from 'react'
import { Pill, Plus, Clock, Check, X, Bell } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { listMeds, addMed, logMed, type Medication } from '../data/medications'
import { createNotification } from '../data/notifications'
import { useToast } from '../components/Toast'

const Medications = () => {
  const { user } = useSupabase()
  const { showToast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
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
    
    if (!createForm.name.trim()) {
      showToast('error', 'Please enter medication name')
      return
    }

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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Medications</h1>
            <p className="text-gray-600">Manage your prescriptions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No medications added yet</h2>
            <p className="text-gray-600 mb-4">Add your medications to track dosages and get reminders</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Medication
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => {
              const nextDue = getNextDueTime(medication.schedule)
              
              return (
                <div key={medication.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                        {medication.dosage && (
                          <p className="text-sm text-gray-600">{medication.dosage}</p>
                        )}
                      </div>
                    </div>
                    
                    {nextDue && (
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {nextDue}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {medication.instructions && (
                    <p className="text-sm text-gray-600 mb-3">{medication.instructions}</p>
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
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark Taken
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add Medication</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateMedication} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Metformin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={createForm.dosage}
                    onChange={(e) => setCreateForm({ ...createForm, dosage: e.target.value })}
                    placeholder="e.g., 500mg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={createForm.instructions}
                    onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                    placeholder="e.g., Take with food"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Type
                  </label>
                  <select
                    value={createForm.scheduleType}
                    onChange={(e) => setCreateForm({ 
                      ...createForm, 
                      scheduleType: e.target.value as 'daily' | 'weekly' | 'as_needed',
                      times: e.target.value === 'as_needed' ? [] : ['08:00']
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                {createForm.scheduleType !== 'as_needed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Times
                    </label>
                    <div className="space-y-2">
                      {createForm.times.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => updateTimeSlot(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          {createForm.times.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTimeSlot}
                        className="w-full py-2 border border-dashed border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
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
  )
}

export default Medications