import { Link, useLocation } from 'react-router-dom'

const DevNav = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Design Root' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/tracking', label: 'Tracking' },
    { path: '/log', label: 'Log' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/profile', label: 'Profile' },
  ]

  return (
    <nav style={{
      background: '#1f2937',
      padding: '1rem',
      borderBottom: '1px solid #374151'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{
          color: '#10b981',
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}>
          HealTrack Dev
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: location.pathname === item.path ? '#10b981' : '#d1d5db',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: location.pathname === item.path ? '#065f46' : 'transparent',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default DevNav