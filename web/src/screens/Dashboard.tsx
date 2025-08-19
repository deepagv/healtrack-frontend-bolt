import { HomeScreen } from '@design/components/HomeScreen'

const Dashboard = () => {
  // Mock user for the exported component
  const mockUser = {
    id: 'demo-user',
    email: 'demo@healtrack.com',
    user_metadata: {
      name: 'Demo User'
    }
  }

  return (
    <div style={{ 
      maxWidth: '428px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      background: '#fff',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <HomeScreen 
        user={mockUser} 
        onNavigateToUpload={() => console.log('Navigate to upload')}
      />
    </div>
  )
}

export default Dashboard