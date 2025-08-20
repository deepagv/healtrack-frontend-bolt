import React, { useState, useEffect } from 'react'
import { User, Save, LogOut, Camera } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { useToast } from '../components/Toast'

const Profile = () => {
  const { supabase, user } = useSupabase()
  const { showToast } = useToast()
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    gender: '',
    dob: '',
    height_cm: '',
    weight_kg: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          gender: data.gender || '',
          dob: data.dob || '',
          height_cm: data.height_cm?.toString() || '',
          weight_kg: data.weight_kg?.toString() || ''
        })
      } else {
        // Create initial profile if it doesn't exist
        await createInitialProfile()
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      showToast('error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const createInitialProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user?.id,
          full_name: user?.user_metadata?.name || '',
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      setProfile(prev => ({
        ...prev,
        full_name: user?.user_metadata?.name || ''
      }))
    } catch (error) {
      console.error('Error creating initial profile:', error)
      showToast('error', 'Failed to create profile')
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      
      const updates = {
        full_name: profile.full_name.trim() || null,
        avatar_url: profile.avatar_url.trim() || null,
        gender: profile.gender || null,
        dob: profile.dob || null,
        height_cm: profile.height_cm ? parseFloat(profile.height_cm) : null,
        weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...updates
        })

      if (error) {
        throw error
      }

      showToast('success', 'Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      showToast('error', 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      // AuthProvider will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error)
      showToast('error', 'Failed to sign out')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleBlur = () => {
    saveProfile()
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-teal-600" />
          </div>
        </div>

        {/* Auth Info (Read-only) */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-200">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <div className="text-gray-500 text-xs font-mono bg-white px-3 py-2 rounded-md border border-gray-200">
                {user?.id}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={profile.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.height_cm}
                  onChange={(e) => handleInputChange('height_cm', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="170"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight_kg}
                  onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="70"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Preview */}
        {profile.avatar_url && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Avatar Preview</h3>
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar_url}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div>
                <p className="text-sm text-gray-600">This is how your avatar will appear</p>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Actions</h3>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile