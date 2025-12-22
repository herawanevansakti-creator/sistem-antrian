'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Application } from '@/types';
import Link from 'next/link';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Briefcase
} from 'lucide-react';

export default function MyApplicationsPage() {
    const { user } = useUser();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (user?.id) {
            loadApplications();
        }
    }, [user?.id]);

    const loadApplications = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from('applications')
            .select(`
        *,
        job:jobs!job_id(id, title)
      `)
            .eq('candidate_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setApplications(data);
        }
        setLoading(false);
    };

    const getStatusInfo = (status: string) => {
        const info: Record<string, { icon: typeof Clock; color: string; label: string; description: string }> = {
            registered: {
                icon: FileText,
                color: 'text-slate-400',
                label: 'Terdaftar',
                description: 'Lamaran Anda telah diterima. Silakan check-in saat tiba di lokasi.'
            },
            waiting: {
                icon: Clock,
                color: 'text-yellow-400',
                label: 'Menunggu',
                description: 'Anda sedang dalam antrean. Pastikan HP tetap aktif untuk notifikasi.'
            },
            assigned: {
                icon: CheckCircle,
                color: 'text-blue-400',
                label: 'Dipanggil',
                description: 'Giliran Anda! Silakan menuju ruang wawancara.'
            },
            interviewing: {
                icon: Briefcase,
                color: 'text-indigo-400',
                label: 'Wawancara',
                description: 'Sesi wawancara sedang berlangsung.'
            },
            completed: {
                icon: CheckCircle,
                color: 'text-green-400',
                label: 'Selesai',
                description: 'Wawancara telah selesai. Terima kasih!'
            },
            skipped: {
                icon: AlertCircle,
                color: 'text-red-400',
                label: 'Dilewati',
                description: 'Anda tidak hadir saat dipanggil. Hubungi admin untuk informasi lebih lanjut.'
            }
        };
        return info[status] || info.registered;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Lamaran Saya</h1>
                    <p className="text-slate-400">Pantau status semua lamaran Anda</p>
                </div>
                <Link href="/dashboard/apply" className="btn-primary flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Lihat Lowongan
                </Link>
            </div>

            {/* Applications List */}
            {applications.length > 0 ? (
                <div className="space-y-4">
                    {applications.map((app, index) => {
                        const statusInfo = getStatusInfo(app.status);
                        const StatusIcon = statusInfo.icon;
                        const isActive = ['waiting', 'assigned', 'interviewing'].includes(app.status);

                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`glass-card p-6 ${isActive ? 'border-orange-500/30' : ''}`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Queue Number */}
                                    <div className="flex-shrink-0">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-orange-400">
                                                {app.queue_number || '#'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-1">
                                            {app.job?.title || 'Posisi tidak tersedia'}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                                            <span className={`text-sm font-medium ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            {statusInfo.description}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-shrink-0">
                                        {isActive ? (
                                            <Link
                                                href="/dashboard/queue-status"
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                Lihat Status
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-sm text-slate-400">Diajukan</p>
                                                <p className="text-white">
                                                    {new Date(app.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline for active applications */}
                                {isActive && (
                                    <div className="mt-6 pt-6 border-t border-slate-700">
                                        <div className="flex items-center justify-between">
                                            {['registered', 'waiting', 'assigned', 'interviewing', 'completed'].map((step, i) => {
                                                const steps = ['registered', 'waiting', 'assigned', 'interviewing', 'completed'];
                                                const currentIndex = steps.indexOf(app.status);
                                                const isCompleted = i < currentIndex;
                                                const isCurrent = i === currentIndex;

                                                return (
                                                    <div key={step} className="flex items-center">
                                                        <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                              ${isCompleted ? 'bg-green-500 text-white' :
                                                                isCurrent ? 'bg-orange-500 text-white animate-pulse' :
                                                                    'bg-slate-700 text-slate-400'}
                            `}>
                                                            {isCompleted ? '✓' : i + 1}
                                                        </div>
                                                        {i < 4 && (
                                                            <div className={`w-12 md:w-20 h-1 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-slate-700'
                                                                }`} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                                            <span>Daftar</span>
                                            <span>Tunggu</span>
                                            <span>Panggil</span>
                                            <span>Interview</span>
                                            <span>Selesai</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">
                        Belum Ada Lamaran
                    </h2>
                    <p className="text-slate-400 mb-6">
                        Anda belum mengajukan lamaran. Jelajahi lowongan yang tersedia.
                    </p>
                    <Link href="/dashboard/apply" className="btn-primary inline-flex items-center gap-2">
                        Lihat Lowongan
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            )}
        </div>
    );
}
