// Notification service for medication reminders and appointment alerts
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: 'medication' | 'appointment' | 'health_insight';
  scheduledTime: Date;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, number> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async scheduleNotification(notification: NotificationData): Promise<boolean> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    const now = new Date();
    const delay = notification.scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // If the time has passed, schedule for the next day
      const nextDay = new Date(notification.scheduledTime);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayDelay = nextDay.getTime() - now.getTime();
      
      const timeoutId = window.setTimeout(() => {
        this.showNotification(notification);
        this.scheduleRecurringNotification(notification);
      }, nextDayDelay);

      this.scheduledNotifications.set(notification.id, timeoutId);
    } else {
      const timeoutId = window.setTimeout(() => {
        this.showNotification(notification);
        this.scheduleRecurringNotification(notification);
      }, delay);

      this.scheduledNotifications.set(notification.id, timeoutId);
    }

    return true;
  }

  private scheduleRecurringNotification(notification: NotificationData) {
    if (notification.type === 'medication') {
      // Reschedule for next day for daily medications
      const nextNotification = {
        ...notification,
        scheduledTime: new Date(notification.scheduledTime.getTime() + 24 * 60 * 60 * 1000)
      };
      this.scheduleNotification(nextNotification);
    }
  }

  private showNotification(notification: NotificationData) {
    if (this.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: '/favicon.ico', // You can add a custom icon
      badge: '/favicon.ico',
      tag: notification.id,
      data: notification.data,
      requireInteraction: notification.type === 'medication',
      actions: notification.type === 'medication' ? [
        { action: 'taken', title: 'Mark as Taken' },
        { action: 'snooze', title: 'Snooze 15min' }
      ] : []
    };

    const browserNotification = new Notification(notification.title, options);

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // You can add navigation logic here
      if (notification.type === 'appointment') {
        // Navigate to appointments screen
        this.handleNotificationClick(notification);
      }
    };

    // Auto close after 10 seconds for non-critical notifications
    if (notification.type !== 'medication') {
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  }

  private handleNotificationClick(notification: NotificationData) {
    // This would integrate with your app's navigation
    // For now, we'll just focus the window
    window.focus();
    
    // You could dispatch a custom event to navigate in the app
    window.dispatchEvent(new CustomEvent('notification-clicked', {
      detail: notification
    }));
  }

  cancelNotification(id: string) {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
    }
  }

  cancelAllNotifications() {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  // Medication reminder helpers
  scheduleMedicationReminder(medication: {
    id: string;
    name: string;
    dosage: string;
    time: string; // "08:00"
    instructions: string;
  }) {
    const [hours, minutes] = medication.time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    const notification: NotificationData = {
      id: `medication-${medication.id}`,
      title: `Time to take ${medication.name}`,
      body: `${medication.dosage} - ${medication.instructions}`,
      type: 'medication',
      scheduledTime,
      data: medication
    };

    return this.scheduleNotification(notification);
  }

  // Appointment reminder helpers
  scheduleAppointmentReminder(appointment: {
    id: string;
    doctor: string;
    specialty: string;
    date: Date;
    type: 'video' | 'in-person';
  }) {
    // Schedule reminder 1 hour before appointment
    const reminderTime = new Date(appointment.date.getTime() - 60 * 60 * 1000);

    const notification: NotificationData = {
      id: `appointment-${appointment.id}`,
      title: `Upcoming Appointment`,
      body: `${appointment.doctor} (${appointment.specialty}) in 1 hour`,
      type: 'appointment',
      scheduledTime: reminderTime,
      data: appointment
    };

    return this.scheduleNotification(notification);
  }

  // Health insight notifications
  scheduleHealthInsight(insight: {
    id: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    const notification: NotificationData = {
      id: `insight-${insight.id}`,
      title: 'Health Insight',
      body: insight.message,
      type: 'health_insight',
      scheduledTime: new Date(), // Send immediately
      data: insight
    };

    return this.scheduleNotification(notification);
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }
}

export const notificationService = NotificationService.getInstance();

// Service Worker for handling notification actions
export const registerNotificationServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }
};