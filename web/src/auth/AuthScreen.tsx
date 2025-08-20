import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for the magic link!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        })

        if (error) {
          setError(error.message)
        } else {
          setMessage('Account created! Check your email to verify your account.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h1 className="text-h1 font-bold text-foreground mb-2">HealTrack</h1>
          <p className="text-body text-muted-foreground">Your health, organized.</p>
        </div>

        {/* Auth Form */}
        <div className="bg-card rounded-card shadow-card border border-border p-6">
          <div className="mb-6">
            <h2 className="text-h2 font-semibold text-center mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-body text-muted-foreground text-center">
              {isSignUp ? 'Join HealTrack to start tracking your health' : 'Sign in to your account'}
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-surface-subtle rounded-lg">
            <button
              onClick={() => setUseMagicLink(true)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                useMagicLink
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Magic Link
            </button>
            <button
              onClick={() => setUseMagicLink(false)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                !useMagicLink
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Password
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-caption text-success">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-caption text-danger">{error}</p>
            </div>
          )}

          {/* Forms */}
          {useMagicLink ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-3 border border-border rounded-md bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-md transition-colors"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <p className="text-caption text-muted-foreground text-center">
                We'll send you a secure link to sign in instantly
              </p>
            </form>
          ) : (
            <form onSubmit={handleEmailPassword} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-12 px-3 border border-border rounded-md bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-3 border border-border rounded-md bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-3 border border-border rounded-md bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-md transition-colors"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Toggle Sign Up / Sign In */}
          {!useMagicLink && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="mt-6 bg-warning/5 border border-warning/20 rounded-lg p-3">
            <p className="text-caption text-muted-foreground text-center">
              <strong>Medical Disclaimer:</strong> HealTrack is for health tracking only. 
              Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}