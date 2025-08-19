import { Routes, Route } from 'react-router-dom'
import DevNav from './components/DevNav'
import DesignRoot from './screens/DesignRoot'
import Dashboard from './screens/Dashboard'
import Tracking from './screens/Tracking'
import Log from './screens/Log'
import Appointments from './screens/Appointments'
import Profile from './screens/Profile'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DevNav />
      <main>
        <Routes>
          <Route path="/" element={<DesignRoot />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/log" element={<Log />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}

export default App