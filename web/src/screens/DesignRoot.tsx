import DesignApp from '@design/App'

const DesignRoot = () => {
  return (
    <div style={{ 
      maxWidth: '428px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      background: '#fff',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <DesignApp />
    </div>
  )
}

export default DesignRoot