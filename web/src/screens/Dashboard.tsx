import React, { useState, useEffect } from 'react'
import { Activity, Heart, Moon, Footprints, Flame, Droplets } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'
import { useSupabase } from '../hooks/useSupabase'
import { listMetrics, getLatestMetrics, type HealthMetric } from '../data/metrics'
import { useToast } from '../components/Toast'

const Dashboard = () => {
  const { user } = useSupabase()
  const { showToast } = useToast()
  const [latestMetrics, setLatestMetrics] = useState<Record<HealthMetric['kind'], HealthMetric | null>>({
    steps: null,
    water: null,
    weight: null,
    heart_rate: null,
    sleep: null,
    calories: null
  })
  const [chartData, setChartData] = useState<Record<HealthMetric['kind'], any[]>>({
    steps: [],
    water: [],
    weight: [],
    heart_rate: [],
    sleep: [],
    calories: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get latest values for each metric
      const latest = await getLatestMetrics()
      setLatestMetrics(latest)
      
      // Get chart data for each metric (last 7 days)
      const kinds: HealthMetric['kind'][] = ['steps', 'water', 'weight', 'heart_rate', 'sleep', 'calories']
      const chartDataPromises = kinds.map(async (kind) => {
        const metrics = await listMetrics(kind, { days: 7 })
        return {
          kind,
          data: metrics.map(m => ({
            date: new Date(m.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: m.value
          })).reverse() // Show oldest to newest for charts
        }
      })
      
      const chartResults = await Promise.all(chartDataPromises)
      const newChartData = chartResults.reduce((acc, { kind, data }) => {
        acc[kind] = data
        return acc
      }, {} as Record<HealthMetric['kind'], any[]>)
      
      setChartData(newChartData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      showToast('error', 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getMetricIcon = (kind: HealthMetric['kind']) => {
    switch (kind) {
      case 'steps': return <Footprints className="w-6 h-6" />
      case 'water': return <Droplets className="w-6 h-6" />
      case 'weight': return <Activity className="w-6 h-6" />
      case 'heart_rate': return <Heart className="w-6 h-6" />
      case 'sleep': return <Moon className="w-6 h-6" />
      case 'calories': return <Flame className="w-6 h-6" />
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
      case 'sleep': return 'hrs'
      case 'calories': return ''
    }
  }

  const formatValue = (kind: HealthMetric['kind'], value: number) => {
    switch (kind) {
      case 'steps':
      case 'calories':
        return value.toLocaleString()
      case 'sleep':
        return (value / 60).toFixed(1) // Convert minutes to hours
      default:
        return value.toString()
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
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.user_metadata?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(['steps', 'water', 'weight', 'heart_rate', 'sleep', 'calories'] as HealthMetric['kind'][]).map((kind) => {
            const metric = latestMetrics[kind]
            const data = chartData[kind]
            
            return (
              <div
                key={kind}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-gray-500">
                    {getMetricIcon(kind)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {getMetricLabel(kind)}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {metric ? formatValue(kind, metric.value) : '--'}
                    {metric && getMetricUnit(kind) && (
                      <span className="text-sm text-gray-500 ml-1">
                        {getMetricUnit(kind)}
                      </span>
                    )}
                  </div>
                  {metric && (
                    <div className="text-xs text-gray-500">
                      {new Date(metric.recorded_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {/* Sparkline */}
                {data.length > 1 && (
                  <div className="h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0EA5A4" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {data.length <= 1 && (
                  <div className="h-8 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No trend data</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard