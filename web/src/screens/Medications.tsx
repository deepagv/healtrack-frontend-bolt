import { LogScreen } from '@design/components/LogScreen';

const Medications = () => {
  return (
    <div style={{ 
      maxWidth: '428px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      background: '#fff',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <LogScreen />
    </div>
  );
};

export default Medications;