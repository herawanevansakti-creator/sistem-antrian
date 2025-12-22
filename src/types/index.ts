// Database Types
export type UserRole = 'admin' | 'interviewer' | 'candidate';
export type QueueStatus = 'registered' | 'waiting' | 'assigned' | 'interviewing' | 'completed' | 'skipped';
export type InterviewerState = 'offline' | 'idle' | 'busy' | 'break';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  interviewer_status: InterviewerState;
  specialization: string | null;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
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
  score_summary: Record<string, unknown> | null;
  started_at: string;
  ended_at: string | null;
  // Joined data
  application?: Application;
  interviewer?: Profile;
}

// API Response Types
export interface RequestNextCandidateResponse {
  status: 'success' | 'empty';
  application_id?: number;
  message?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalCandidates: number;
  waitingCount: number;
  interviewingCount: number;
  completedCount: number;
  availableInterviewers: number;
}
