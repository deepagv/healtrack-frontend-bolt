import React, { useState } from 'react';
import { Activity, Heart, Moon, Footprints, Calendar, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function TrackingScreen() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const stepData = [
    { day: 'Mon', steps: 8247 },
    { day: 'Tue', steps: 9156 },
    { day: 'Wed', steps: 7543 },
    { day: 'Thu', steps: 10234 },
    { day: 'Fri', steps: 8876 },
    { day: 'Sat', steps: 12453 },
    { day: 'Sun', steps: 8547 },
  ];

  const heartRateData = [
    { time: '6AM', hr: 68 },
    { time: '9AM', hr: 75 },
    { time: '12PM', hr: 82 },
    { time: '3PM', hr: 78 },
    { time: '6PM', hr: 85 },
    { time: '9PM', hr: 72 },
  ];

  const sleepData = [
    { day: 'Mon', deep: 1.5, light: 4.2, rem: 1.8 },
    { day: 'Tue', deep: 1.8, light: 4.5, rem: 2.1 },
    { day: 'Wed', deep: 1.2, light: 3.8, rem: 1.5 },
    { day: 'Thu', deep: 2.1, light: 4.8, rem: 2.3 },
    { day: 'Fri', deep: 1.7, light: 4.1, rem: 1.9 },
    { day: 'Sat', deep: 2.3, light: 5.2, rem: 2.5 },
    { day: 'Sun', deep: 1.9, light: 4.6, rem: 2.1 },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card p-4 border-b border-subtle">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-h2 font-semibold">Activity Tracking</h1>
          <Button variant="outline" size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Time Range Filter */}
        <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center">
                  <Footprints className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-caption text-low">Today's Steps</p>
                  <p className="text-h3 font-semibold">8,547</p>
                  <p className="text-caption text-success">+5% vs yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-critical/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-critical" />
                </div>
                <div>
                  <p className="text-caption text-low">Avg Heart Rate</p>
                  <p className="text-h3 font-semibold">72 bpm</p>
                  <p className="text-caption text-low">Resting: 65 bpm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-caption text-low">Last Night</p>
                  <p className="text-h3 font-semibold">7h 23m</p>
                  <p className="text-caption text-success">Good quality</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-caption text-low">Active Minutes</p>
                  <p className="text-h3 font-semibold">45 min</p>
                  <p className="text-caption text-low">Goal: 60 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Steps Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3">Steps This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stepData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="steps" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-4 text-caption text-low">
              <span>Avg: 9,294 steps/day</span>
              <span>Goal: 10,000</span>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3">Heart Rate Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateData}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Line 
                    type="monotone" 
                    dataKey="hr" 
                    stroke="var(--color-critical)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-critical)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-4 text-caption text-low">
              <span>Resting: 65 bpm</span>
              <span>Max today: 105 bpm</span>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Analysis */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3">Sleep This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="deep" stackId="a" fill="var(--color-accent)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="light" stackId="a" fill="var(--color-primary-600)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rem" stackId="a" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-caption text-low">Deep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                <span className="text-caption text-low">Light</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-caption text-low">REM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Source */}
        <Card className="shadow-card border-primary-600/20 bg-primary-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body font-medium">Data Source</p>
                <p className="text-caption text-low">Connected to Apple Health</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}