'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@/types';
import Link from 'next/link';
import {
    Clock,
    CheckCircle,
    User,
    Calendar,
    Star,
    FileText
} from 'lucide-react';

export default function MySessionsPage() {
    const { user } = useUser();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (user?.id) {
            loadSessions();
        }
    }, [user?.id]);

    const loadSessions = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from('sessions')
            .select(`
        *,
        application:applications!application_id(
          id,
          queue_number,
          status,
          candidate:profiles!candidate_id(id, full_name, email),
          job:jobs!job_id(id, title)
        )
      `)
            .eq('interviewer_id', user.id)
            .order('started_at', { ascending: false });

        if (!error && data) {
            setSessions(data);
        }
        setLoading(false);
    };

    const calculateDuration = (start: string, end: string | null) => {
        if (!end) return 'Ongoing';

        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const diff = endTime - startTime;

        const minutes = Math.floor(diff / 60000);
        return `${minutes} menit`;
    };

    const getAverageScore = (scores: Record<string, number> | null) => {
        if (!scores) return null;
        const values = Object.values(scores);
        if (values.length === 0) return null;
        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner" />
            </div>
        );
    }

    // Stats
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.ended_at).length;
    const todaySessions = sessions.filter(s => {
        const today = new Date();
        const sessionDate = new Date(s.started_at);
        return sessionDate.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Sesi Wawancara Saya</h1>
                <p className="text-slate-400">Riwayat dan statistik sesi wawancara Anda</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{totalSessions}</p>
                            <p className="text-sm text-slate-400">Total Sesi</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{completedSessions}</p>
                            <p className="text-sm text-slate-400">Selesai</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{todaySessions}</p>
                            <p className="text-sm text-slate-400">Hari Ini</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sessions List */}
            {sessions.length > 0 ? (
                <div className="glass-card overflow-hidden">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Kandidat</th>
                                    <th>Posisi</th>
                                    <th>Tanggal</th>
                                    <th>Durasi</th>
                                    <th>Skor</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => {
                                    const avgScore = getAverageScore(session.score_summary as Record<string, number> | null);

                                    return (
                                        <motion.tr
                                            key={session.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {session.application?.candidate?.full_name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-slate-400">
                                                            {session.application?.queue_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-slate-300">
                                                {session.application?.job?.title || '-'}
                                            </td>
                                            <td className="text-slate-400">
                                                {new Date(session.started_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-300">
                                                        {calculateDuration(session.started_at, session.ended_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {avgScore ? (
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-medium text-white">{avgScore}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-end">
                                                    {!session.ended_at ? (
                                                        <Link
                                                            href={`/dashboard/interview/${session.application_id}`}
                                                            className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/30 transition-colors"
                                                        >
                                                            Lanjutkan
                                                        </Link>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium">
                                                            Selesai
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">
                        Belum Ada Sesi
                    </h2>
                    <p className="text-slate-400 mb-6">
                        Anda belum melakukan wawancara. Klik tombol &quot;Saya Siap&quot; di halaman antrean untuk memulai.
                    </p>
                    <Link href="/dashboard/queue" className="btn-primary">
                        Lihat Antrean
                    </Link>
                </div>
            )}
        </div>
    );
}
