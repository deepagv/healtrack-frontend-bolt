import React, { useState } from 'react';
import { ArrowLeft, Bell, Clock, Shield, TestTube2 } from 'lucide-react';
import { Button } from './core/Button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

export function NotificationSettingsScreen({ onBack }: NotificationSettingsScreenProps) {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [settings, setSettings] = useState({
    medications: true,
    appointments: true,
    insights: true,
    quietHoursEnabled: false,
    quietStart: '22:00',
    quietEnd: '07:00'
  });

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Show test notification
        new Notification('HealTrack', {
          body: 'Notifications are now enabled!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const sendTestNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from HealTrack.',
        icon: '/favicon.ico'
      });
    }
  };

  const updateSetting = (key: keyof typeof settings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted': return 'text-success';
      case 'denied': return 'text-danger';
      default: return 'text-warning';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted': return 'Enabled';
      case 'denied': return 'Blocked';
      default: return 'Not Set';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          <Button 
            variant="tertiary" 
            size="sm"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-h2 font-semibold text-foreground">Notifications</h1>
            <p className="text-caption text-muted-foreground">Manage your health reminders</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Permission Status */}
        <div className="bg-card rounded-card p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-600/10 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-h3 font-semibold text-foreground">Permission Status</h2>
              <p className="text-caption text-muted-foreground">
                Current status: <span className={`font-medium ${getPermissionStatusColor()}`}>
                  {getPermissionStatusText()}
                </span>
              </p>
            </div>
          </div>

          {permissionStatus !== 'granted' && (
            <div className="space-y-3">
              <p className="text-body text-muted-foreground">
                {permissionStatus === 'denied' 
                  ? 'Notifications are blocked. Please enable them in your browser settings.'
                  : 'Enable notifications to receive health reminders and alerts.'
                }
              </p>
              
              {permissionStatus === 'default' && (
                <Button onClick={requestPermission} className="w-full">
                  Enable Notifications
                </Button>
              )}
              
              {permissionStatus === 'denied' && (
                <div className="bg-warning/5 border border-warning/20 rounded-tile p-3">
                  <p className="text-caption text-warning">
                    To enable notifications, click the lock icon in your browser's address bar and allow notifications for this site.
                  </p>
                </div>
              )}
            </div>
          )}

          {permissionStatus === 'granted' && (
            <Button 
              variant="secondary" 
              onClick={sendTestNotification}
              className="w-full"
            >
              <TestTube2 className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          )}
        </div>

        {/* Notification Types */}
        <div className="bg-card rounded-card p-6 shadow-card border border-border">
          <h2 className="text-h3 font-semibold text-foreground mb-4">Reminder Types</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Medication Reminders</p>
                  <p className="text-caption text-muted-foreground">Get notified when it's time to take your medications</p>
                </div>
              </div>
              <Switch
                checked={settings.medications}
                onCheckedChange={(checked) => updateSetting('medications', checked)}
                disabled={permissionStatus !== 'granted'}
                aria-label="Toggle medication reminders"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent-600/10 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-accent-600" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Appointment Reminders</p>
                  <p className="text-caption text-muted-foreground">Alerts 1 hour before scheduled appointments</p>
                </div>
              </div>
              <Switch
                checked={settings.appointments}
                onCheckedChange={(checked) => updateSetting('appointments', checked)}
                disabled={permissionStatus !== 'granted'}
                aria-label="Toggle appointment reminders"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600/10 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Health Insights</p>
                  <p className="text-caption text-muted-foreground">AI-generated tips based on your health data</p>
                </div>
              </div>
              <Switch
                checked={settings.insights}
                onCheckedChange={(checked) => updateSetting('insights', checked)}
                disabled={permissionStatus !== 'granted'}
                aria-label="Toggle health insights"
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-card rounded-card p-6 shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-h3 font-semibold text-foreground">Quiet Hours</h2>
              <p className="text-caption text-muted-foreground">Pause non-urgent notifications during these hours</p>
            </div>
            <Switch
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => updateSetting('quietHoursEnabled', checked)}
              disabled={permissionStatus !== 'granted'}
              aria-label="Toggle quiet hours"
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <label className="text-caption font-medium text-foreground mb-2 block">From</label>
                <Select 
                  value={settings.quietStart} 
                  onValueChange={(value) => updateSetting('quietStart', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                    <SelectItem value="00:00">12:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-caption font-medium text-foreground mb-2 block">To</label>
                <Select 
                  value={settings.quietEnd} 
                  onValueChange={(value) => updateSetting('quietEnd', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="bg-surface-subtle rounded-card p-4 border border-border">
          <h3 className="text-body font-medium text-foreground mb-2">About Notifications</h3>
          <ul className="space-y-1 text-caption text-muted-foreground">
            <li>• Critical medication reminders will always come through</li>
            <li>• You can adjust these settings anytime</li>
            <li>• Your preferences are stored securely and privately</li>
            <li>• Notifications help you stay on track with your health goals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}