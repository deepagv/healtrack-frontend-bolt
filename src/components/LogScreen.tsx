import React, { useState } from 'react';
import { Plus, Camera, Search, Droplets } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

export function LogScreen() {
  const [waterGlasses, setWaterGlasses] = useState(6);
  const targetGlasses = 8;

  const meals = [
    {
      name: 'Breakfast',
      items: ['Oatmeal with berries', 'Greek yogurt'],
      calories: 340,
      logged: true,
    },
    {
      name: 'Lunch',
      items: ['Grilled chicken salad', 'Olive oil dressing'],
      calories: 420,
      logged: true,
    },
    {
      name: 'Dinner',
      items: [],
      calories: 0,
      logged: false,
    },
    {
      name: 'Snacks',
      items: ['Apple', 'Almonds (1 oz)'],
      calories: 155,
      logged: true,
    },
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const targetCalories = 1800;
  const remainingCalories = targetCalories - totalCalories;

  const macros = {
    protein: { current: 85, target: 135, color: 'bg-critical' },
    carbs: { current: 125, target: 225, color: 'bg-warning' },
    fat: { current: 45, target: 60, color: 'bg-success' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card p-4 border-b border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-semibold">Nutrition Log</h1>
            <p className="text-caption text-low">Track your daily intake</p>
          </div>
          <Button size="icon" className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Calorie Summary */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - totalCalories / targetCalories)}`}
                    className="text-primary-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-h2 font-semibold">{totalCalories}</span>
                  <span className="text-caption text-low">of {targetCalories}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-body font-medium">{remainingCalories} calories remaining</p>
              <p className="text-caption text-low">Goal: {targetCalories} calories/day</p>
            </div>
          </CardContent>
        </Card>

        {/* Macros */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3">Macronutrients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(macros).map(([name, data]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-medium capitalize">{name}</span>
                  <span className="text-caption text-low">{data.current}g / {data.target}g</span>
                </div>
                <Progress 
                  value={(data.current / data.target) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Meals */}
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <Card key={index} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-h3 font-semibold">{meal.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-body font-medium">{meal.calories} cal</span>
                    <Button size="icon" variant="ghost" className="w-8 h-8">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {meal.items.length > 0 ? (
                  <div className="space-y-1">
                    {meal.items.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-body text-low">{item}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-caption text-low italic">No items logged</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Add */}
        <div>
          <h2 className="text-h3 font-semibold mb-3">Quick Add</h2>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Camera className="w-5 h-5" />
              <span className="text-caption">Scan Barcode</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Search className="w-5 h-5" />
              <span className="text-caption">Search Food</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Plus className="w-5 h-5" />
              <span className="text-caption">Recent</span>
            </Button>
          </div>
        </div>

        {/* Water Intake */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary-600" />
              Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-body">{waterGlasses} of {targetGlasses} glasses</span>
              <Button 
                size="sm" 
                onClick={() => setWaterGlasses(Math.min(waterGlasses + 1, targetGlasses))}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="grid grid-cols-8 gap-1 mb-2">
              {Array.from({ length: targetGlasses }, (_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg border-2 ${
                    i < waterGlasses 
                      ? 'bg-primary-600 border-primary-600' 
                      : 'border-border'
                  }`}
                />
              ))}
            </div>
            
            <Progress value={(waterGlasses / targetGlasses) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}