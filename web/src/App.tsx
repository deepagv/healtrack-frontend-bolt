import React, { useState } from 'react'
import { AuthGate } from './auth/AuthGate'
import { ToastProvider } from './components/Toast'
import { BottomNav, TabType } from '@design/components/core/BottomNav'
import Dashboard from './screens/Dashboard'
import Trackers from './screens/Trackers'
import Medications from './screens/Medications'
import Appointments from './screens/Appointments'
import Goals from './screens/Goals'
import Profile from './screens/Profile'
import Settings from './screens/Settings'
import Notifications from './screens/Notifications'

type AppScreen = TabType | 'goals' | 'settings' | 'notifications'

function App() {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('dashboard')

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <Dashboard />
      case 'track':
        return <Trackers />
      case 'log':
        return <Goals />
      case 'appointments':
        return <Appointments />
      case 'profile':
        return <Profile onNavigateToSettings={() => setActiveScreen('settings')} />
      case 'settings':
        return <Settings onBack={() => setActiveScreen('profile')} />
      case 'notifications':
        return <Notifications onBack={() => setActiveScreen('profile')} />
      default:
        return <Dashboard />
    }
  }

  const hideBottomNav = ['settings', 'notifications'].includes(activeScreen)
  const activeTab = ['home', 'track', 'log', 'appointments', 'profile'].includes(activeScreen) 
    ? activeScreen as TabType 
    : 'home'

  return (
    <ToastProvider>
      <AuthGate>
        <div className="flex flex-col h-screen bg-background max-w-md mx-auto">
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {renderScreen()}
          </div>

          {/* Bottom Navigation */}
          {!hideBottomNav && (
            <BottomNav
              activeTab={activeTab}
              onTabChange={(tab) => setActiveScreen(tab)}
            />
          )}
        </div>
      </AuthGate>
    </ToastProvider>
  )
}

export default App