import { NotificationSettingsScreen } from '@design/components/NotificationSettingsScreen';

const Notifications = () => {
  return (
    <div style={{ 
      maxWidth: '428px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      background: '#fff',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <NotificationSettingsScreen 
        onBack={() => window.history.back()}
      />
    </div>
  );
};

export default Notifications;