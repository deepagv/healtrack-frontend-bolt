import { Routes, Route } from 'react-router-dom'
import DevNav from './components/DevNav'
import DesignRoot from './screens/DesignRoot'
import Dashboard from './screens/Dashboard'
import Trackers from './screens/Trackers'
import Medications from './screens/Medications'
import Appointments from './screens/Appointments'
import Goals from './screens/Goals'
import Profile from './screens/Profile'
import Settings from './screens/Settings'
import Notifications from './screens/Notifications'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DevNav />
      <main>
        <Routes>
          <Route path="/" element={<DesignRoot />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trackers" element={<Trackers />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* 404 handling - redirect to dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App