'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
    Application,
    Job,
    Profile,
    JobAnalytics,
    TodayStats,
    ScoreSummary,
    CheckinResponse,
    CompleteSessionResponse,
    RequestNextCandidateResponse
} from '@/types';

const supabase = createClient();

// Hook untuk mendapatkan profile user
export function useProfile(userId: string | null) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        async function fetchProfile() {
            console.log('[useProfile] Fetching profile for userId:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            console.log('[useProfile] Result:', { data, error });

            if (!error && data) {
                console.log('[useProfile] Profile loaded - Role:', data.role);
                setProfile(data as Profile);
            } else {
                console.log('[useProfile] No profile found or error');
            }
            setLoading(false);
        }

        fetchProfile();

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`profile:${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${userId}`
            }, (payload) => {
                setProfile(payload.new as Profile);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { profile, loading };
}

// Hook untuk mendapatkan daftar jobs
export function useJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchJobs() {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('is_active', true)
                .order('title');

            if (!error && data) {
                setJobs(data as Job[]);
            }
            setLoading(false);
        }

        fetchJobs();
    }, []);

    return { jobs, loading };
}

// Hook untuk mendapatkan aplikasi kandidat
export function useCandidateApplication(candidateId: string | null) {
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!candidateId) {
            setLoading(false);
            return;
        }

        async function fetchApplication() {
            const { data, error } = await supabase
                .from('applications')
                .select('*, job:jobs(*)')
                .eq('candidate_id', candidateId)
                .in('status', ['waiting', 'assigned', 'interviewing'])
                .order('checked_in_at', { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                setApplication(data as Application);
            }
            setLoading(false);
        }

        fetchApplication();

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`candidate_app:${candidateId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'applications',
                filter: `candidate_id=eq.${candidateId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    const newApp = payload.new as Application;
                    if (['waiting', 'assigned', 'interviewing'].includes(newApp.status)) {
                        setApplication(newApp);
                    } else {
                        setApplication(null);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [candidateId]);

    return { application, loading };
}

// Hook untuk antrean (interviewer/admin)
export function useQueue() {
    const [queue, setQueue] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = useCallback(async () => {
        const { data, error } = await supabase
            .from('applications')
            .select('*, job:jobs(*), candidate:profiles(*)')
            .eq('status', 'waiting')
            .order('checked_in_at', { ascending: true });

        if (!error && data) {
            setQueue(data as Application[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchQueue();

        // Subscribe to realtime changes on applications
        const channel = supabase
            .channel('queue_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'applications'
            }, () => {
                fetchQueue();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchQueue]);

    return { queue, loading, refresh: fetchQueue };
}

// Hook untuk sesi aktif interviewer
export function useActiveSession(interviewerId: string | null) {
    const [activeApp, setActiveApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!interviewerId) {
            setLoading(false);
            return;
        }

        async function fetchActiveSession() {
            // Alternative: check applications table for assigned status directly
            // This is simpler and avoids nested query type issues
            const { data: app } = await supabase
                .from('applications')
                .select('*, job:jobs(*), candidate:profiles(*)')
                .eq('status', 'assigned')
                .order('checked_in_at', { ascending: true })
                .limit(1)
                .single();

            if (app) {
                setActiveApp(app as Application);
            } else {
                setActiveApp(null);
            }
            setLoading(false);
        }

        fetchActiveSession();

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`interviewer_session:${interviewerId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'sessions',
                filter: `interviewer_id=eq.${interviewerId}`
            }, () => {
                fetchActiveSession();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'applications'
            }, () => {
                fetchActiveSession();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [interviewerId]);

    return { activeApp, loading };
}

// Hook untuk analytics
export function useAnalytics() {
    const [jobAnalytics, setJobAnalytics] = useState<JobAnalytics[]>([]);
    const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
    const [completedApps, setCompletedApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            // Fetch job analytics view
            const { data: analytics } = await supabase
                .from('job_analytics')
                .select('*');

            if (analytics) {
                setJobAnalytics(analytics as JobAnalytics[]);
            }

            // Fetch today stats
            const { data: stats } = await supabase.rpc('get_today_stats');
            if (stats) {
                setTodayStats(stats as TodayStats);
            }

            // Fetch completed applications
            const { data: completed } = await supabase
                .from('applications')
                .select('*, job:jobs(*), candidate:profiles(*)')
                .eq('status', 'completed')
                .order('checked_in_at', { ascending: false })
                .limit(50);

            if (completed) {
                setCompletedApps(completed as Application[]);
            }

            setLoading(false);
        }

        fetchAnalytics();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('analytics_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'applications'
            }, () => {
                fetchAnalytics();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { jobAnalytics, todayStats, completedApps, loading };
}

// Function untuk check-in dengan lokasi
export async function checkInWithLocation(
    candidateId: string,
    jobId: number,
    latitude: number,
    longitude: number
): Promise<CheckinResponse> {
    const { data, error } = await supabase.rpc('checkin_with_location', {
        p_candidate_id: candidateId,
        p_job_id: jobId,
        p_latitude: latitude,
        p_longitude: longitude
    });

    if (error) {
        return { status: 'error', message: error.message };
    }

    return data as CheckinResponse;
}

// Function untuk request kandidat berikutnya
export async function requestNextCandidate(
    interviewerId: string
): Promise<RequestNextCandidateResponse> {
    const { data, error } = await supabase.rpc('request_next_candidate', {
        interviewer_id_input: interviewerId
    });

    if (error) {
        return { status: 'empty', message: error.message };
    }

    return data as RequestNextCandidateResponse;
}

// Function untuk complete session
export async function completeInterviewSession(
    applicationId: number,
    interviewerId: string,
    duration: number,
    scores: ScoreSummary
): Promise<CompleteSessionResponse> {
    const { data, error } = await supabase.rpc('complete_interview_session', {
        p_application_id: applicationId,
        p_interviewer_id: interviewerId,
        p_duration: duration,
        p_score_technical: scores.technical,
        p_score_communication: scores.communication,
        p_score_attitude: scores.attitude,
        p_notes: scores.notes
    });

    if (error) {
        return { status: 'error', message: error.message };
    }

    return data as CompleteSessionResponse;
}

// Function untuk update interviewer status
export async function updateInterviewerStatus(
    interviewerId: string,
    status: 'offline' | 'idle' | 'busy' | 'break'
) {
    const { error } = await supabase
        .from('profiles')
        .update({ interviewer_status: status })
        .eq('id', interviewerId);

    return !error;
}
