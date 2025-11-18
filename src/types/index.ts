export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Hair Check Types
export type HairCheckStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
export type AnalysisStatus = 'good' | 'warning' | 'critical';

export interface HairCheckPhotos {
  front: string;
  right45: string;
  left45: string;
  top: string;
  back: string;
}

export interface HairCheck {
  id: string;
  user_id: string;
  photo_front: string;
  photo_right45: string;
  photo_left45: string;
  photo_top: string;
  photo_back: string;
  status: HairCheckStatus;
  analysis_score?: number;
  analysis_status?: AnalysisStatus;
  analysis_notes?: string;
  recommendations?: string;
  created_at: string;
  updated_at: string;
  analyzed_at?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export interface PhotoStep {
  id: keyof HairCheckPhotos;
  label: string;
  icon: string;
  description: string;
  instruction?: string;
  subInstruction?: string;
  targetAngle?: { pitch: number; roll: number };
  requiresFace?: boolean;
  faceRotation?: number;
}

// Appointment Types
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type ServiceType = 
  | 'hair_transplant_consultation'
  | 'hair_analysis'
  | 'hair_treatment'
  | 'follow_up'
  | 'other';

export interface Appointment {
  id: string;
  user_id: string;
  appointment_date: string; // YYYY-MM-DD format
  appointment_time: string; // HH:MM format
  service_type: ServiceType;
  status: AppointmentStatus;
  patient_notes?: string;
  doctor_notes?: string;
  estimated_price?: number;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
}

export interface ServiceOption {
  id: ServiceType;
  title: string;
  description: string;
  icon: string;
  estimatedDuration: string;
  estimatedPrice?: string;
}

// Profile Types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Message Types
export interface Message {
  id: string;
  user_id: string;
  message: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
}

export interface ChatUser {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

