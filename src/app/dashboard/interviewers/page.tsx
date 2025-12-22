'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Profile, InterviewerState } from '@/types';
import { toast } from 'sonner';
import {
    Users2,
    Plus,
    Mail,
    Shield,
    Search,
    MoreVertical,
    UserMinus,
    UserPlus
} from 'lucide-react';

export default function InterviewersPage() {
    const [interviewers, setInterviewers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();

    useEffect(() => {
        loadInterviewers();
        setupRealtimeSubscription();

        return () => {
            supabase.removeAllChannels();
        };
    }, []);

    const loadInterviewers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'interviewer')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInterviewers(data);
        }
        setLoading(false);
    };

    const setupRealtimeSubscription = () => {
        supabase
            .channel('interviewers-status')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: 'role=eq.interviewer'
            }, () => {
                loadInterviewers();
            })
            .subscribe();
    };

    const updateRole = async (id: string, role: 'interviewer' | 'candidate') => {
        const { error } = await supabase
            .from('profiles')
            .update({ role, interviewer_status: role === 'interviewer' ? 'offline' : 'offline' })
            .eq('id', id);

        if (!error) {
            toast.success(`Role diperbarui ke ${role}`);
            loadInterviewers();
        } else {
            toast.error('Gagal memperbarui role');
        }
    };

    const getStatusBadge = (status: InterviewerState) => {
        const styles: Record<InterviewerState, string> = {
            offline: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
            idle: 'bg-green-500/15 text-green-400 border-green-500/30',
            busy: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
            break: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        };

        const labels: Record<InterviewerState, string> = {
            offline: 'Offline',
            idle: 'Siap',
            busy: 'Sibuk',
            break: 'Istirahat',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status === 'idle' ? 'bg-green-400 animate-pulse' :
                        status === 'busy' ? 'bg-orange-400' :
                            status === 'break' ? 'bg-yellow-400' : 'bg-slate-400'
                    }`} />
                {labels[status]}
            </span>
        );
    };

    const filteredInterviewers = interviewers.filter(interviewer =>
        interviewer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interviewer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onlineCount = interviewers.filter(i => i.interviewer_status !== 'offline').length;
    const idleCount = interviewers.filter(i => i.interviewer_status === 'idle').length;
    const busyCount = interviewers.filter(i => i.interviewer_status === 'busy').length;

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
                <h1 className="text-2xl font-bold text-white mb-1">Kelola Pewawancara</h1>
                <p className="text-slate-400">Monitor dan kelola tim pewawancara</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <p className="text-3xl font-bold text-white">{interviewers.length}</p>
                    <p className="text-sm text-slate-400">Total Pewawancara</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-3xl font-bold text-green-400">{onlineCount}</p>
                    <p className="text-sm text-slate-400">Online</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-3xl font-bold text-blue-400">{idleCount}</p>
                    <p className="text-sm text-slate-400">Siap Menerima</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-3xl font-bold text-orange-400">{busyCount}</p>
                    <p className="text-sm text-slate-400">Sedang Wawancara</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari pewawancara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12"
                />
            </div>

            {/* Interviewers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInterviewers.map((interviewer) => (
                    <motion.div
                        key={interviewer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card glass-card-hover p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                    {interviewer.full_name?.charAt(0) || 'I'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {interviewer.full_name || 'Pewawancara'}
                                    </h3>
                                    <p className="text-sm text-slate-400 truncate max-w-[150px]">
                                        {interviewer.email}
                                    </p>
                                </div>
                            </div>
                            {getStatusBadge(interviewer.interviewer_status)}
                        </div>

                        {interviewer.specialization && (
                            <div className="mb-4">
                                <span className="text-xs text-slate-400">Spesialisasi:</span>
                                <span className="ml-2 text-sm text-white">{interviewer.specialization}</span>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t border-slate-700">
                            <button
                                onClick={() => updateRole(interviewer.id, 'candidate')}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm"
                            >
                                <UserMinus className="w-4 h-4" />
                                Hapus Akses
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredInterviewers.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Users2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-lg text-slate-400">
                        {searchQuery ? 'Tidak ada pewawancara yang cocok' : 'Belum ada pewawancara'}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        Undang pengguna dan tetapkan role &apos;interviewer&apos; di Clerk Dashboard
                    </p>
                </div>
            )}

            {/* Info Card */}
            <div className="glass-card p-6 border-l-4 border-orange-500">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-400" />
                    Cara Menambah Pewawancara
                </h3>
                <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Buka Dashboard Clerk Anda</li>
                    <li>Undang user baru via email atau buat user manual</li>
                    <li>Edit Public Metadata user tersebut: <code className="bg-slate-800 px-2 py-0.5 rounded">{`{ "role": "interviewer" }`}</code></li>
                    <li>User akan otomatis muncul di halaman ini setelah login</li>
                </ol>
            </div>
        </div>
    );
}
