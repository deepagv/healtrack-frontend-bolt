import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Ruler, Scale, Trash2, AlertTriangle } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { useToast } from '../components/Toast'

const Settings = () => {
  const { supabase, user } = useSupabase()
  const { showToast } = useToast()
  const [units, setUnits] = useState({
    system: 'metric' as 'metric' | 'imperial',
    temperature: 'celsius' as 'celsius' | 'fahrenheit'
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const savedUnits = localStorage.getItem('healtrack_units')
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveUnits = (newUnits: typeof units) => {
    try {
      setUnits(newUnits)
      localStorage.setItem('healtrack_units', JSON.stringify(newUnits))
      showToast('success', 'Unit preferences saved')
    } catch (error) {
      console.error('Error saving units:', error)
      showToast('error', 'Failed to save preferences')
    }
  }

  const handleUnitSystemChange = (system: 'metric' | 'imperial') => {
    saveUnits({ ...units, system })
  }

  const handleTemperatureChange = (temperature: 'celsius' | 'fahrenheit') => {
    saveUnits({ ...units, temperature })
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('error', 'Please type DELETE to confirm')
      return
    }

    try {
      setDeleting(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('http://localhost:3001/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete account')
      }

      showToast('success', 'Account deleted successfully')
      
      // Sign out after successful deletion
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
            <p className="text-gray-600">Customize your app preferences</p>
          </div>
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-teal-600" />
          </div>
        </div>

        {/* Units Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Units & Measurements</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Measurement System
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUnitSystemChange('metric')}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors
                    ${units.system === 'metric'
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Ruler className="w-4 h-4" />
                  <div className="text-center">
                    <div className="font-medium">Metric</div>
                    <div className="text-xs text-gray-500">cm, kg, °C</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleUnitSystemChange('imperial')}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors
                    ${units.system === 'imperial'
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Scale className="w-4 h-4" />
                  <div className="text-center">
                    <div className="font-medium">Imperial</div>
                    <div className="text-xs text-gray-500">ft/in, lbs, °F</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Temperature
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTemperatureChange('celsius')}
                  className={`
                    p-3 rounded-lg border transition-colors text-center
                    ${units.temperature === 'celsius'
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="font-medium">Celsius</div>
                  <div className="text-xs text-gray-500">°C</div>
                </button>
                
                <button
                  onClick={() => handleTemperatureChange('fahrenheit')}
                  className={`
                    p-3 rounded-lg border transition-colors text-center
                    ${units.temperature === 'fahrenheit'
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="font-medium">Fahrenheit</div>
                  <div className="text-xs text-gray-500">°F</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All health metrics and tracking data</li>
                    <li>• Medications and appointment records</li>
                    <li>• Goals and notification preferences</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {deleting ? 'Deleting...' : 'Delete Forever'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings