export interface RouteConfig {
  path: string;
  label: string;
  component: React.ComponentType;
}

// Typed route definitions
export const routes = {
  dashboard: '/dashboard',
  trackers: '/trackers', 
  medications: '/medications',
  appointments: '/appointments',
  goals: '/goals',
  profile: '/profile',
  settings: '/settings',
  notifications: '/notifications'
} as const;

export type RouteKey = keyof typeof routes;
export type RoutePath = typeof routes[RouteKey];