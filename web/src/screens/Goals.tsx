import React, { useState, useEffect } from 'react'
import { Target, Plus, Activity, Heart, Moon, Footprints, Flame, Droplets, X } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'
import { getGoals, createGoal, updateGoal, deleteGoal, type Goal } from '../data/goals'
import { listMetrics, type HealthMetric } from '../data/metrics'
import { useToast } from '../components/Toast'

const Goals = () => {
  const { user } = useSupabase()
  const { showToast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [todayMetrics, setTodayMetrics] = useState<Record<HealthMetric['kind'], number>>({
    steps: 0,
    water: 0,
    weight: 0,
    heart_rate: 0,
    sleep: 0,
    calories: 0
  })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    kind: 'steps' as HealthMetric['kind'],
    target: '',
    unit: '',
    period: 'daily' as Goal['period']
  })

  useEffect(() => {
    if (user) {
      loadGoalsData()
    }
  }, [user])

  const loadGoalsData = async () => {
    try {
      setLoading(true)
      
      // Load goals
      const goalsData = await getGoals()
      setGoals(goalsData)
      
      // Load today's metrics for progress calculation
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const kinds: HealthMetric['kind'][] = ['steps', 'water', 'weight', 'heart_rate', 'sleep', 'calories']
      const todayData: Record<HealthMetric['kind'], number> = {
        steps: 0,
        water: 0,
        weight: 0,
        heart_rate: 0,
        sleep: 0,
        calories: 0
      }
      
      for (const kind of kinds) {
        const metrics = await listMetrics(kind, { days: 1 })
        const todayMetrics = metrics.filter(m => {
          const metricDate = new Date(m.recorded_at)
          metricDate.setHours(0, 0, 0, 0)
          return metricDate.getTime() === today.getTime()
        })
        
        if (kind === 'weight' || kind === 'heart_rate') {
          // For weight and heart rate, use the latest value
          todayData[kind] = todayMetrics.length > 0 ? todayMetrics[0].value : 0
        } else {
          // For other metrics, sum the values
          todayData[kind] = todayMetrics.reduce((sum, m) => sum + m.value, 0)
        }
      }
      
      setTodayMetrics(todayData)
    } catch (error) {
      console.error('Error loading goals data:', error)
      showToast('error', 'Failed to load goals data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.target) {
      showToast('error', 'Please enter a target value')
      return
    }

    try {
      const target = parseFloat(createForm.target)
      if (isNaN(target) || target <= 0) {
        showToast('error', 'Please enter a valid target value')
        return
      }

      await createGoal(
        createForm.kind,
        target,
        createForm.unit || getDefaultUnit(createForm.kind),
        createForm.period
      )

      showToast('success', 'Goal created successfully')
      setShowCreateModal(false)
      setCreateForm({
        kind: 'steps',
        target: '',
        unit: '',
        period: 'daily'
      })
      
      loadGoalsData()
    } catch (error) {
      console.error('Error creating goal:', error)
      showToast('error', 'Failed to create goal')
    }
  }

  const getMetricIcon = (kind: HealthMetric['kind']) => {
    switch (kind) {
      case 'steps': return <Footprints className="w-5 h-5" />
      case 'water': return <Droplets className="w-5 h-5" />
      case 'weight': return <Activity className="w-5 h-5" />
      case 'heart_rate': return <Heart className="w-5 h-5" />
      case 'sleep': return <Moon className="w-5 h-5" />
      case 'calories': return <Flame className="w-5 h-5" />
    }
  }

  const getMetricLabel = (kind: HealthMetric['kind']) => {
    switch (kind) {
      case 'steps': return 'Steps'
      case 'water': return 'Water'
      case 'weight': return 'Weight'
      case 'heart_rate': return 'Heart Rate'
      case 'sleep': return 'Sleep'
      case 'calories': return 'Calories'
    }
  }

  const getDefaultUnit = (kind: HealthMetric['kind']) => {
    switch (kind) {
      case 'steps': return ''
      case 'water': return 'glasses'
      case 'weight': return 'lbs'
      case 'heart_rate': return 'bpm'
      case 'sleep': return 'hours'
      case 'calories': return ''
    }
  }

  const calculateProgress = (goal: Goal) => {
    const current = todayMetrics[goal.kind] || 0
    let adjustedCurrent = current
    
    // Convert sleep from minutes to hours if needed
    if (goal.kind === 'sleep' && goal.unit === 'hours') {
      adjustedCurrent = current / 60
    }
    
    return Math.min((adjustedCurrent / goal.target) * 100, 100)
  }

  const formatValue = (kind: HealthMetric['kind'], value: number, unit?: string) => {
    if (kind === 'sleep' && unit === 'hours') {
      return (value / 60).toFixed(1)
    }
    if (kind === 'steps' || kind === 'calories') {
      return value.toLocaleString()
    }
    return value.toString()
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Goals</h1>
            <p className="text-gray-600">Track your health targets</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No goals set yet</h2>
            <p className="text-gray-600 mb-4">Create your first health goal to start tracking progress</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = calculateProgress(goal)
              const currentValue = todayMetrics[goal.kind] || 0
              const displayValue = formatValue(goal.kind, currentValue, goal.unit)
              
              return (
                <div key={goal.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-teal-600">
                      {getMetricIcon(goal.kind)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {getMetricLabel(goal.kind)} Goal
                      </h3>
                      <p className="text-sm text-gray-600">
                        {goal.target} {goal.unit} {goal.period}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {displayValue}
                      </div>
                      <div className="text-sm text-gray-500">
                        of {goal.target} {goal.unit}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Today's Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {progress >= 100 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      Goal achieved!
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create Goal</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metric Type
                  </label>
                  <select
                    value={createForm.kind}
                    onChange={(e) => setCreateForm({ 
                      ...createForm, 
                      kind: e.target.value as HealthMetric['kind'],
                      unit: getDefaultUnit(e.target.value as HealthMetric['kind'])
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="steps">Steps</option>
                    <option value="water">Water</option>
                    <option value="weight">Weight</option>
                    <option value="heart_rate">Heart Rate</option>
                    <option value="sleep">Sleep</option>
                    <option value="calories">Calories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={createForm.target}
                    onChange={(e) => setCreateForm({ ...createForm, target: e.target.value })}
                    placeholder="e.g., 10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={createForm.unit}
                    onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                    placeholder={getDefaultUnit(createForm.kind)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    value={createForm.period}
                    onChange={(e) => setCreateForm({ ...createForm, period: e.target.value as Goal['period'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
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
                    Create Goal
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

export default Goals