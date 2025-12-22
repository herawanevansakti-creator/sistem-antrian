'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Application, Session } from '@/types';
import { toast } from 'sonner';
import {
    User,
    FileText,
    Clock,
    Video,
    CheckCircle,
    Star,
    MessageSquare,
    ArrowLeft,
    ExternalLink
} from 'lucide-react';

export default function InterviewPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const applicationId = params.id as string;

    const [application, setApplication] = useState<Application | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [scores, setScores] = useState({
        technical: 0,
        communication: 0,
        attitude: 0
    });
    const supabase = createClient();

    useEffect(() => {
        if (applicationId) {
            loadData();
        }
    }, [applicationId]);

    const loadData = async () => {
        // Load application
        const { data: appData } = await supabase
            .from('applications')
            .select(`
        *,
        candidate:profiles!candidate_id(*),
        job:jobs!job_id(*)
      `)
            .eq('id', applicationId)
            .single();

        if (appData) {
            setApplication(appData);
        }

        // Load session
        const { data: sessionData } = await supabase
            .from('sessions')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (sessionData) {
            setSession(sessionData);
            if (sessionData.score_summary) {
                setScores(sessionData.score_summary as typeof scores);
            }
        }

        setLoading(false);
    };

    const startInterview = async () => {
        if (!application) return;

        // Update application status
        await supabase
            .from('applications')
            .update({ status: 'interviewing' })
            .eq('id', application.id);

        toast.success('Wawancara dimulai');
        loadData();
    };

    const completeInterview = async () => {
        if (!application || !session) return;

        // Update session with scores
        await supabase
            .from('sessions')
            .update({
                score_summary: scores,
                ended_at: new Date().toISOString()
            })
            .eq('id', session.id);

        // Update application status
        await supabase
            .from('applications')
            .update({ status: 'completed' })
            .eq('id', application.id);

        // Update interviewer status back to idle
        if (user?.id) {
            await supabase
                .from('profiles')
                .update({ interviewer_status: 'idle' })
                .eq('id', user.id);
        }

        toast.success('Wawancara selesai');
        router.push('/dashboard/queue');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="glass-card p-12 text-center">
                <p className="text-lg text-slate-400">Data tidak ditemukan</p>
                <button
                    onClick={() => router.push('/dashboard/queue')}
                    className="btn-ghost mt-4"
                >
                    Kembali ke Antrean
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/dashboard/queue')}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Sesi Wawancara</h1>
                    <p className="text-slate-400">
                        {application.job?.title} - {application.queue_number}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Candidate Info */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-400" />
                            Informasi Kandidat
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-400">Nama Lengkap</p>
                                    <p className="text-lg font-medium text-white">
                                        {application.candidate?.full_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Email</p>
                                    <p className="text-white">{application.candidate?.email || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-400">Posisi Dilamar</p>
                                    <p className="text-lg font-medium text-white">
                                        {application.job?.title || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Waktu Check-in</p>
                                    <p className="text-white">
                                        {application.checked_in_at
                                            ? new Date(application.checked_in_at).toLocaleString('id-ID')
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {application.cv_url && (
                            <a
                                href={application.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                Lihat CV
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </motion.div>

                    {/* Scoring Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-orange-400" />
                            Penilaian
                        </h2>

                        <div className="space-y-6">
                            {Object.entries(scores).map(([key, value]) => (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-300 capitalize">
                                            {key === 'technical' ? 'Kemampuan Teknis' :
                                                key === 'communication' ? 'Komunikasi' : 'Sikap'}
                                        </label>
                                        <span className="text-lg font-bold text-orange-400">{value}/10</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={value}
                                        onChange={(e) => setScores({
                                            ...scores,
                                            [key]: parseInt(e.target.value)
                                        })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Notes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-orange-400" />
                            Catatan
                        </h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tambahkan catatan tentang kandidat..."
                            className="input-field min-h-[120px] resize-none"
                        />
                    </motion.div>
                </div>

                {/* Actions Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4">Status Sesi</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Status</span>
                                <span className={`status-badge status-${application.status}`}>
                                    {application.status}
                                </span>
                            </div>

                            {session && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Mulai</span>
                                        <span className="text-white">
                                            {new Date(session.started_at).toLocaleTimeString('id-ID')}
                                        </span>
                                    </div>
                                    {session.ended_at && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Selesai</span>
                                            <span className="text-white">
                                                {new Date(session.ended_at).toLocaleTimeString('id-ID')}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                    >
                        {application.status === 'assigned' && (
                            <button
                                onClick={startInterview}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                            >
                                <Video className="w-5 h-5" />
                                Mulai Wawancara
                            </button>
                        )}

                        {application.status === 'interviewing' && (
                            <button
                                onClick={completeInterview}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors font-semibold"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Selesai Wawancara
                            </button>
                        )}

                        {session?.room_link && (
                            <a
                                href={session.room_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                <Video className="w-5 h-5" />
                                Buka Meeting
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </motion.div>

                    {/* Timer */}
                    {application.status === 'interviewing' && session && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6 text-center"
                        >
                            <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">Durasi Wawancara</p>
                            <InterviewTimer startTime={session.started_at} />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Timer Component
function InterviewTimer({ startTime }: { startTime: string }) {
    const [elapsed, setElapsed] = useState('00:00');

    useEffect(() => {
        const start = new Date(startTime).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - start;

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setElapsed(
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <p className="text-3xl font-bold text-white font-mono">{elapsed}</p>
    );
}
