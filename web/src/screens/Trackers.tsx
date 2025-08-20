import React, { useState, useEffect } from 'react'
import { Activity, Heart, Moon, Footprints, Flame, Droplets, Plus } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts'
import { useSupabase } from '../hooks/useSupabase'
import { listMetrics, addMetric, type HealthMetric } from '../data/metrics'
import { useToast } from '../components/Toast'

const Trackers = () => {
  const { user } = useSupabase()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<HealthMetric['kind']>('steps')
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    value: '',
    notes: '',
    recordedAt: new Date().toISOString().slice(0, 16) // datetime-local format
  })

  useEffect(() => {
    if (user) {
      loadMetrics(activeTab)
    }
  }, [user, activeTab])

  const loadMetrics = async (kind: HealthMetric['kind']) => {
    try {
      setLoading(true)
      const data = await listMetrics(kind, { days: 30 })
      setMetrics(data)
    } catch (error) {
      console.error('Error loading metrics:', error)
      showToast('error', `Failed to load ${kind} data`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.value) {
      showToast('error', 'Please enter a value')
      return
    }

    try {
      const value = parseFloat(formData.value)
      if (isNaN(value)) {
        showToast('error', 'Please enter a valid number')
        return
      }

      await addMetric(
        activeTab,
        value,
        getMetricUnit(activeTab),
        formData.notes || undefined,
        new Date(formData.recordedAt)
      )

      showToast('success', `${getMetricLabel(activeTab)} added successfully`)
      
      // Reset form
      setFormData({
        value: '',
        notes: '',
        recordedAt: new Date().toISOString().slice(0, 16)
      })
      
      // Reload data
      loadMetrics(activeTab)
    } catch (error) {
      console.error('Error adding metric:', error)
      showToast('error', `Failed to add ${activeTab}`)
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

  const getMetricUnit = (kind: HealthMetric['kind']) => {
    switch (kind) {
      case 'steps': return ''
      case 'water': return 'glasses'
      case 'weight': return 'lbs'
      case 'heart_rate': return 'bpm'
      case 'sleep': return 'minutes'
      case 'calories': return ''
    }
  }

  const getPlaceholder = (kind: HealthMetric['kind']) => {
    switch (kind) {
      case 'steps': return 'e.g., 8500'
      case 'water': return 'e.g., 8'
      case 'weight': return 'e.g., 150'
      case 'heart_rate': return 'e.g., 72'
      case 'sleep': return 'e.g., 480 (minutes)'
      case 'calories': return 'e.g., 2000'
    }
  }

  const formatValue = (kind: HealthMetric['kind'], value: number) => {
    return value.toString()
  }

  const chartData = metrics.map(m => ({
    date: new Date(m.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: m.value
  })).reverse()

  const tabs: HealthMetric['kind'][] = ['steps', 'water', 'weight', 'heart_rate', 'sleep', 'calories']

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card p-4 border-b border-border">
        <h1 className="text-h2 font-semibold text-foreground">Health Trackers</h1>
        <p className="text-caption text-muted-foreground">Track your daily metrics</p>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                ${activeTab === tab 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {getMetricIcon(tab)}
              {getMetricLabel(tab)}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {getMetricLabel(activeTab)} Trend
          </h2>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0EA5A4" 
                    strokeWidth={3}
                    dot={{ fill: '#0EA5A4', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No data available for {getMetricLabel(activeTab).toLowerCase()}
            </div>
          )}
        </div>

        {/* Add Entry Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add {getMetricLabel(activeTab)} Entry
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value {getMetricUnit(activeTab) && `(${getMetricUnit(activeTab)})`}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={getPlaceholder(activeTab)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.recordedAt}
                onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add {getMetricLabel(activeTab)}
            </button>
          </form>
        </div>

        {/* Recent Entries */}
        {metrics.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h2>
            <div className="space-y-2">
              {metrics.slice(0, 5).map((metric) => (
                <div key={metric.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatValue(activeTab, metric.value)} {getMetricUnit(activeTab)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(metric.recorded_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {metric.notes && (
                    <div className="text-sm text-gray-600 max-w-32 truncate">
                      {metric.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default Trackers