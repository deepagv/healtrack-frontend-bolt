import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Heart, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { notificationService } from '../utils/notifications';
import { apiCall } from '../utils/supabase/client';

interface NotificationSettingsProps {
  user: any;
  onClose: () => void;
}

export function NotificationSettings({ user, onClose }: NotificationSettingsProps) {
  const [permissions, setPermissions] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    medicationReminders: true,
    appointmentReminders: true,
    healthInsights: true,
    dailyCheckIn: false,
    weeklyReports: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
    loadUserPreferences();
  }, []);

  const checkNotificationStatus = () => {
    if (notificationService.isSupported()) {
      setPermissions(notificationService.getPermissionStatus());
    }
  };

  const loadUserPreferences = async () => {
    try {
      const profile = await apiCall('/user/profile');
      if (profile.profile?.notification_preferences) {
        setSettings(profile.profile.notification_preferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const requestPermission = async () => {
    setLoading(true);
    const granted = await notificationService.requestPermission();
    setPermissions(granted ? 'granted' : 'denied');
    setLoading(false);

    if (granted) {
      // Schedule sample notifications for active medications
      const sampleMedication = {
        id: 'sample-med',
        name: 'Sample Medication',
        dosage: '1 tablet',
        time: '09:00',
        instructions: 'Take with food'
      };
      
      notificationService.scheduleMedicationReminder(sampleMedication);
    }
  };

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await apiCall('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });

      // Handle specific notification scheduling
      if (key === 'medicationReminders' && value) {
        // Schedule medication reminders (you'd get actual medications from the backend)
        const sampleMedication = {
          id: 'sample-med',
          name: 'Sample Medication',
          dosage: '1 tablet',
          time: '09:00',
          instructions: 'Take with food'
        };
        notificationService.scheduleMedicationReminder(sampleMedication);
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const testNotification = () => {
    if (permissions === 'granted') {
      notificationService.scheduleHealthInsight({
        id: 'test-notification',
        message: 'This is a test notification from HealTrack!',
        priority: 'low'
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card p-4 border-b border-subtle flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-h2 font-semibold">Notification Settings</h1>
          <p className="text-caption text-low">Manage your health reminders</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Permission Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Permission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-body font-medium">Browser Notifications</p>
                <p className="text-caption text-low">
                  {permissions === 'granted' 
                    ? 'Notifications are enabled' 
                    : permissions === 'denied'
                    ? 'Notifications are blocked'
                    : 'Click to enable notifications'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={permissions === 'granted' ? 'default' : 'secondary'}
                  className={permissions === 'granted' ? 'bg-success text-white' : ''}
                >
                  {permissions === 'granted' ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Enabled
                    </>
                  ) : permissions === 'denied' ? (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Blocked
                    </>
                  ) : (
                    'Not Set'
                  )}
                </Badge>
              </div>
            </div>

            {permissions !== 'granted' && (
              <Button 
                onClick={requestPermission} 
                disabled={loading || permissions === 'denied'}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                {loading ? 'Requesting...' : 'Enable Notifications'}
              </Button>
            )}

            {permissions === 'granted' && (
              <Button 
                onClick={testNotification}
                variant="outline"
                className="w-full"
              >
                Send Test Notification
              </Button>
            )}

            {permissions === 'denied' && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <p className="text-caption text-warning">
                  Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications for this site.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3">Reminder Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-body font-medium">Medication Reminders</p>
                  <p className="text-caption text-low">Get notified when it's time to take your medications</p>
                </div>
              </div>
              <Switch 
                checked={settings.medicationReminders} 
                onCheckedChange={(value) => updateSetting('medicationReminders', value)}
                disabled={permissions !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-body font-medium">Appointment Reminders</p>
                  <p className="text-caption text-low">Alerts 1 hour before scheduled appointments</p>
                </div>
              </div>
              <Switch 
                checked={settings.appointmentReminders} 
                onCheckedChange={(value) => updateSetting('appointmentReminders', value)}
                disabled={permissions !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-body font-medium">Health Insights</p>
                  <p className="text-caption text-low">AI-generated tips based on your health data</p>
                </div>
              </div>
              <Switch 
                checked={settings.healthInsights} 
                onCheckedChange={(value) => updateSetting('healthInsights', value)}
                disabled={permissions !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-body font-medium">Daily Check-in</p>
                  <p className="text-caption text-low">Reminder to log your daily health metrics</p>
                </div>
              </div>
              <Switch 
                checked={settings.dailyCheckIn} 
                onCheckedChange={(value) => updateSetting('dailyCheckIn', value)}
                disabled={permissions !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-body font-medium">Weekly Reports</p>
                  <p className="text-caption text-low">Summary of your health progress each week</p>
                </div>
              </div>
              <Switch 
                checked={settings.weeklyReports} 
                onCheckedChange={(value) => updateSetting('weeklyReports', value)}
                disabled={permissions !== 'granted'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-h3">Quiet Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-body font-medium mb-2">Do not disturb</p>
                <p className="text-caption text-low mb-4">
                  Medication reminders will still come through, but other notifications will be silenced during these hours.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-caption text-low">From</label>
                    <select className="w-full mt-1 p-2 border border-border rounded-md bg-background">
                      <option value="22:00">10:00 PM</option>
                      <option value="23:00">11:00 PM</option>
                      <option value="00:00">12:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-caption text-low">To</label>
                    <select className="w-full mt-1 p-2 border border-border rounded-md bg-background">
                      <option value="06:00">6:00 AM</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="08:00">8:00 AM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <div className="bg-surface-subtle rounded-lg p-4">
          <h3 className="text-body font-medium mb-2">About Notifications</h3>
          <ul className="space-y-1 text-caption text-low">
            <li>• Notifications help you stay on track with your health goals</li>
            <li>• You can always adjust these settings or turn them off completely</li>
            <li>• Critical health alerts will always come through regardless of settings</li>
            <li>• Your notification preferences are stored securely and privately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}