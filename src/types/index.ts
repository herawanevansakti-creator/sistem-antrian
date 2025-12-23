// Database Types
export type UserRole = 'admin' | 'interviewer' | 'candidate';
export type QueueStatus = 'registered' | 'waiting' | 'assigned' | 'interviewing' | 'completed' | 'skipped';
export type InterviewerState = 'offline' | 'idle' | 'busy' | 'break';

export interface ScoreSummary {
  technical: number;
  communication: number;
  attitude: number;
  notes: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  interviewer_status: InterviewerState;
  specialization: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Job {
  id: number;
  title: string;
  description: string | null;
  department: string | null;
  max_candidates: number;
  is_active: boolean;
  created_at: string;
}

export interface Application {
  id: number;
  candidate_id: string;
  job_id: number;
  queue_number: string | null;
  status: QueueStatus;
  cv_url: string | null;
  checked_in_at: string | null;
  checked_in_date: string | null;
  duration: number;
  location_lat: number | null;
  location_lng: number | null;
  location_verified: boolean;
  score_summary: ScoreSummary | null;
  created_at: string;
  // Joined data
  candidate?: Profile;
  job?: Job;
}

export interface Session {
  id: number;
  application_id: number;
  interviewer_id: string;
  room_link: string | null;
  score_summary: ScoreSummary | null;
  started_at: string;
  ended_at: string | null;
  // Joined data
  application?: Application;
  interviewer?: Profile;
}

// View Types
export interface JobAnalytics {
  job_id: number;
  job_title: string;
  total_applicants: number;
  waiting_count: number;
  completed_count: number;
  avg_duration_seconds: number;
  avg_score: number;
}

export interface ActiveQueue {
  id: number;
  queue_number: string;
  status: QueueStatus;
  checked_in_at: string;
  duration: number;
  location_verified: boolean;
  score_summary: ScoreSummary | null;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  job_id: number;
}

export interface CompletedInterview {
  id: number;
  queue_number: string;
  checked_in_at: string;
  duration: number;
  score_summary: ScoreSummary | null;
  candidate_name: string;
  job_title: string;
  score_technical: number;
  score_communication: number;
  score_attitude: number;
  reviewer_notes: string | null;
}

// API Response Types
export interface RequestNextCandidateResponse {
  status: 'success' | 'empty';
  application_id?: number;
  message?: string;
}

export interface CheckinResponse {
  status: 'success' | 'error';
  application_id?: number;
  queue_number?: string;
  message?: string;
}

export interface CompleteSessionResponse {
  status: 'success' | 'error';
  message?: string;
  application_id?: number;
}

export interface TodayStats {
  total_today: number;
  completed_today: number;
  waiting_now: number;
  avg_duration_seconds: number;
  avg_score: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalCandidates: number;
  waitingCount: number;
  interviewingCount: number;
  completedCount: number;
  availableInterviewers: number;
}
