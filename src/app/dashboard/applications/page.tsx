'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Application, Job } from '@/types';
import { toast } from 'sonner';
import {
    FileText,
    Search,
    Filter,
    Eye,
    SkipForward,
    CheckCircle,
    Clock,
    Download
} from 'lucide-react';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [jobFilter, setJobFilter] = useState<string>('all');
    const supabase = createClient();

    useEffect(() => {
        loadData();
        setupRealtimeSubscription();

        return () => {
            supabase.removeAllChannels();
        };
    }, []);

    const loadData = async () => {
        // Load applications
        const { data: appsData } = await supabase
            .from('applications')
            .select(`
        *,
        candidate:profiles!candidate_id(id, full_name, email),
        job:jobs!job_id(id, title)
      `)
            .order('created_at', { ascending: false });

        if (appsData) {
            setApplications(appsData);
        }

        // Load jobs for filter
        const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .eq('is_active', true);

        if (jobsData) {
            setJobs(jobsData);
        }

        setLoading(false);
    };

    const setupRealtimeSubscription = () => {
        supabase
            .channel('applications-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
                loadData();
            })
            .subscribe();
    };

    const updateStatus = async (id: number, status: string) => {
        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', id);

        if (!error) {
            toast.success(`Status diperbarui ke ${status}`);
        } else {
            toast.error('Gagal memperbarui status');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            registered: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
            waiting: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
            assigned: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
            interviewing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
            completed: 'bg-green-500/15 text-green-400 border-green-500/30',
            skipped: 'bg-red-500/15 text-red-400 border-red-500/30',
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            app.candidate?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.candidate?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.queue_number?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesJob = jobFilter === 'all' || app.job_id.toString() === jobFilter;

        return matchesSearch && matchesStatus && matchesJob;
    });

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
                <h1 className="text-2xl font-bold text-white mb-1">Kelola Aplikasi</h1>
                <p className="text-slate-400">Lihat dan kelola semua lamaran kandidat</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama, email, atau nomor antrean..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field w-full md:w-48"
                >
                    <option value="all">Semua Status</option>
                    <option value="registered">Terdaftar</option>
                    <option value="waiting">Menunggu</option>
                    <option value="assigned">Dipanggil</option>
                    <option value="interviewing">Wawancara</option>
                    <option value="completed">Selesai</option>
                    <option value="skipped">Dilewati</option>
                </select>
                <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="input-field w-full md:w-48"
                >
                    <option value="all">Semua Posisi</option>
                    {jobs.map(job => (
                        <option key={job.id} value={job.id.toString()}>{job.title}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['waiting', 'assigned', 'interviewing', 'completed', 'skipped'].map(status => {
                    const count = applications.filter(a => a.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
                            className={`glass-card p-4 text-center transition-all ${statusFilter === status ? 'border-orange-500/50' : ''
                                }`}
                        >
                            <p className="text-2xl font-bold text-white">{count}</p>
                            <p className="text-xs text-slate-400 capitalize">{status}</p>
                        </button>
                    );
                })}
            </div>

            {/* Applications Table */}
            <div className="glass-card overflow-hidden">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No. Antrean</th>
                                <th>Kandidat</th>
                                <th>Posisi</th>
                                <th>Status</th>
                                <th>Check-in</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((app) => (
                                <motion.tr
                                    key={app.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td>
                                        <span className="font-mono font-semibold text-orange-400">
                                            {app.queue_number || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <p className="font-medium text-white">
                                                {app.candidate?.full_name || 'N/A'}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {app.candidate?.email || '-'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="text-slate-300">{app.job?.title || '-'}</td>
                                    <td>{getStatusBadge(app.status)}</td>
                                    <td className="text-slate-400">
                                        {app.checked_in_at
                                            ? new Date(app.checked_in_at).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end gap-2">
                                            {app.cv_url && (
                                                <a
                                                    href={app.cv_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                                    title="Lihat CV"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            )}
                                            {app.status === 'waiting' && (
                                                <button
                                                    onClick={() => updateStatus(app.id, 'skipped')}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                                    title="Lewati"
                                                >
                                                    <SkipForward className="w-4 h-4" />
                                                </button>
                                            )}
                                            {app.status === 'interviewing' && (
                                                <button
                                                    onClick={() => updateStatus(app.id, 'completed')}
                                                    className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                                                    title="Selesai"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredApplications.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        Tidak ada aplikasi yang ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
