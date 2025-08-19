import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export type User = {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
};

export type AuthResponse = {
  user: User | null;
  session: any | null;
  error: any | null;
};

// Auth functions
export const signUp = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fef8588c/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { user: null, session: null, error: { message: data } };
    }

    // After successful signup, sign in to get session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: signInData?.user as User,
      session: signInData?.session,
      error: signInError
    };
  } catch (error) {
    return { user: null, session: null, error };
  }
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data?.user as User,
    session: data?.session,
    error
  };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user as User | null;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// API functions
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const session = await getCurrentSession();
  const token = session?.access_token || publicAnonKey;

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fef8588c${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Health data functions
export const getDashboardData = async () => {
  return apiCall('/health/dashboard');
};

export const getUserProfile = async () => {
  return apiCall('/user/profile');
};

export const updateUserProfile = async (profileData: any) => {
  return apiCall('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const uploadReport = async (file: File) => {
  const session = await getCurrentSession();
  const token = session?.access_token || publicAnonKey;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fef8588c/reports/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  return response.json();
};

export const analyzeReport = async (reportId: string) => {
  return apiCall(`/reports/${reportId}/analyze`, {
    method: 'POST',
  });
};

export const getUserReports = async () => {
  return apiCall('/reports');
};

export const getMedications = async () => {
  return apiCall('/medications');
};

export const addMedication = async (medicationData: any) => {
  return apiCall('/medications', {
    method: 'POST',
    body: JSON.stringify(medicationData),
  });
};

export const getAppointments = async () => {
  return apiCall('/appointments');
};

export const addAppointment = async (appointmentData: any) => {
  return apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
};

export const saveActivityData = async (activityData: any) => {
  return apiCall('/tracking/activity', {
    method: 'POST',
    body: JSON.stringify(activityData),
  });
};