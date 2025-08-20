import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Ruler, Scale, Trash2, AlertTriangle } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { useToast } from '../components/Toast'

interface SettingsProps {
  onBack: () => void
}

const Settings = ({ onBack }: SettingsProps) => {
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
      
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('http://localhost:3001/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
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

import { ArrowLeft } from 'lucide-react'

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-surface-subtle hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-h2 font-semibold text-foreground">Settings</h1>
            <p className="text-caption text-muted-foreground">Customize your app preferences</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="p-4">

        {/* Units Preferences */}
        <div className="bg-card rounded-card border border-border p-4 mb-6 shadow-card">
          <h2 className="text-h3 font-semibold text-foreground mb-4">Units & Measurements</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-body font-medium text-foreground mb-3">
                Measurement System
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUnitSystemChange('metric')}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors
                    ${units.system === 'metric'
                      ? 'bg-primary-600/10 border-primary-600/20 text-primary-600'
                      : 'bg-card border-border text-foreground hover:bg-surface-subtle'
                    }
                  `}
                >
                  <Ruler className="w-4 h-4" />
                  <div className="text-center">
                    <div className="text-body font-medium">Metric</div>
                    <div className="text-caption text-muted-foreground">cm, kg, °C</div>
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
        {/* About / Version */}
        <div className="bg-card rounded-card border border-border p-4 shadow-card">
          <h2 className="text-h3 font-semibold text-foreground mb-4">About</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-body text-muted-foreground">Version</span>
              <span className="text-body font-medium text-foreground">1.0.0</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-body text-muted-foreground">Build</span>
              <span className="text-caption font-mono text-muted-foreground">
                {process.env.VITE_COMMIT_HASH || 'dev-build'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-body text-muted-foreground">Supabase Project</span>
              <span className="text-caption font-mono text-muted-foreground">
                {import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'local'}
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-card border border-danger/20 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <h2 className="text-h3 font-semibold text-danger">Danger Zone</h2>
          </div>
          
          <p className="text-body text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-danger text-white py-3 px-4 rounded-button hover:bg-danger/90 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-card p-6 w-full max-w-md shadow-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h2 className="text-h2 font-semibold text-foreground">Delete Account</h2>
                  <p className="text-caption text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-danger/5 border border-danger/20 rounded-card p-3">
                  <p className="text-body text-danger">
                    <strong>Warning:</strong> This will permanently delete:
                  </p>
                  <ul className="text-caption text-danger mt-2 space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All health metrics and tracking data</li>
                    <li>• Medications and appointment records</li>
                    <li>• Goals and notification preferences</li>
                  </ul>
                </div>

                <div>
                  <label htmlFor="delete-confirm" className="block text-body font-medium text-foreground mb-2">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full h-12 px-3 border border-border rounded-button bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-danger focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                    className="flex-1 h-12 px-4 border border-border text-foreground rounded-button hover:bg-surface-subtle transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                    className="flex-1 h-12 bg-danger text-white px-4 rounded-button hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    </div>
  )
}

export default Settings