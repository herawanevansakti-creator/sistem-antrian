'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Job, Application } from '@/types';
import { toast } from 'sonner';
import {
    Briefcase,
    Upload,
    CheckCircle,
    Clock,
    ArrowRight
} from 'lucide-react';

export default function ApplyPage() {
    const { user } = useUser();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [existingApplications, setExistingApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<number | null>(null);
    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const loadData = async () => {
        // Load active jobs
        const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (jobsData) {
            setJobs(jobsData);
        }

        // Load existing applications
        if (user?.id) {
            const { data: appsData } = await supabase
                .from('applications')
                .select('*')
                .eq('candidate_id', user.id);

            if (appsData) {
                setExistingApplications(appsData);
            }
        }

        setLoading(false);
    };

    const generateQueueNumber = () => {
        const prefix = 'A';
        const number = Math.floor(Math.random() * 999) + 1;
        return `${prefix}-${number.toString().padStart(3, '0')}`;
    };

    const handleApply = async (jobId: number) => {
        if (!user?.id) {
            toast.error('Silakan login terlebih dahulu');
            return;
        }

        // Check if already applied
        const alreadyApplied = existingApplications.find(a => a.job_id === jobId);
        if (alreadyApplied) {
            toast.error('Anda sudah melamar untuk posisi ini');
            return;
        }

        setApplying(jobId);

        const { data, error } = await supabase
            .from('applications')
            .insert({
                candidate_id: user.id,
                job_id: jobId,
                queue_number: generateQueueNumber(),
                status: 'registered'
            })
            .select()
            .single();

        if (error) {
            toast.error('Gagal mengajukan lamaran');
            console.error(error);
        } else {
            toast.success('Lamaran berhasil diajukan!');
            setExistingApplications([...existingApplications, data]);
        }

        setApplying(null);
    };

    const getApplicationStatus = (jobId: number) => {
        return existingApplications.find(a => a.job_id === jobId);
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
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Lowongan Tersedia</h1>
                <p className="text-slate-400">Pilih posisi yang Anda minati dan ajukan lamaran</p>
            </div>

            {/* Jobs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => {
                    const application = getApplicationStatus(job.id);
                    const hasApplied = !!application;

                    return (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card glass-card-hover p-6"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center">
                                    <Briefcase className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {job.title}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Diposting {new Date(job.created_at).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            {hasApplied ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="text-sm font-medium">Sudah Melamar</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-800/50">
                                        <p className="text-xs text-slate-400 mb-1">Nomor Antrean</p>
                                        <p className="text-lg font-bold text-orange-400">
                                            {application.queue_number}
                                        </p>
                                    </div>
                                    <a
                                        href="/dashboard/queue-status"
                                        className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
                                    >
                                        Lihat Status
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleApply(job.id)}
                                    disabled={applying === job.id}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {applying === job.id ? (
                                        <div className="spinner w-5 h-5" />
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Lamar Sekarang
                                        </>
                                    )}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {jobs.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Briefcase className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-lg text-slate-400">Belum ada lowongan tersedia</p>
                    <p className="text-sm text-slate-500 mt-2">
                        Silakan cek kembali nanti
                    </p>
                </div>
            )}

            {/* My Applications */}
            {existingApplications.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-white mb-4">Lamaran Saya</h2>
                    <div className="glass-card overflow-hidden">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>No. Antrean</th>
                                        <th>Posisi</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {existingApplications.map((app) => {
                                        const job = jobs.find(j => j.id === app.job_id);
                                        return (
                                            <tr key={app.id}>
                                                <td>
                                                    <span className="font-mono font-bold text-orange-400">
                                                        {app.queue_number}
                                                    </span>
                                                </td>
                                                <td className="text-white">{job?.title || '-'}</td>
                                                <td>
                                                    <span className={`status-badge status-${app.status}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="text-slate-400">
                                                    {new Date(app.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
