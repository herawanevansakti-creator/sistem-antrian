'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Application } from '@/types';
import { Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface QueueDisplayProps {
    jobId?: number;
    showOnlyWaiting?: boolean;
}

export default function QueueDisplay({ jobId, showOnlyWaiting = false }: QueueDisplayProps) {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        loadApplications();
        setupRealtimeSubscription();

        return () => {
            supabase.removeAllChannels();
        };
    }, [jobId]);

    const loadApplications = async () => {
        let query = supabase
            .from('applications')
            .select(`
        *,
        candidate:profiles!candidate_id(id, full_name, email),
        job:jobs!job_id(id, title)
      `)
            .order('checked_in_at', { ascending: true });

        if (showOnlyWaiting) {
            query = query.in('status', ['waiting', 'assigned']);
        }

        if (jobId) {
            query = query.eq('job_id', jobId);
        }

        const { data, error } = await query;

        if (!error && data) {
            setApplications(data);
        }
        setLoading(false);
    };

    const setupRealtimeSubscription = () => {
        const channel = supabase
            .channel('applications-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'applications',
                },
                () => {
                    loadApplications();
                }
            )
            .subscribe();
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            registered: 'status-badge bg-slate-500/15 text-slate-400 border-slate-500/30',
            waiting: 'status-badge status-waiting',
            assigned: 'status-badge status-assigned',
            interviewing: 'status-badge status-interviewing',
            completed: 'status-badge status-completed',
            skipped: 'status-badge status-skipped',
        };

        const labels: Record<string, string> = {
            registered: 'Terdaftar',
            waiting: 'Menunggu',
            assigned: 'Dipanggil',
            interviewing: 'Wawancara',
            completed: 'Selesai',
            skipped: 'Dilewati',
        };

        return (
            <span className={styles[status] || styles.registered}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="spinner" />
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-lg text-slate-400">Belum ada antrean saat ini</p>
                <p className="text-sm text-slate-500 mt-2">
                    Antrean akan muncul saat kandidat melakukan check-in
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence mode="popLayout">
                {applications.map((app, index) => (
                    <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`glass-card p-6 ${app.status === 'assigned' ? 'border-orange-500/50 animate-pulse-glow' : ''
                            }`}
                    >
                        <div className="flex items-center gap-6">
                            {/* Queue Number */}
                            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-orange-400">
                                    {app.queue_number || `#${index + 1}`}
                                </span>
                            </div>

                            {/* Candidate Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-lg font-semibold text-white truncate">
                                        {app.candidate?.full_name || 'Kandidat'}
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-400 truncate mb-3">
                                    {app.job?.title || 'Posisi tidak diketahui'}
                                </p>
                                {getStatusBadge(app.status)}
                            </div>

                            {/* Time Info */}
                            <div className="flex-shrink-0 text-right">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">
                                        {app.checked_in_at
                                            ? new Date(app.checked_in_at).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : '-'
                                        }
                                    </span>
                                </div>
                                {app.status === 'assigned' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center gap-1 text-orange-400"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Giliran Anda!</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
