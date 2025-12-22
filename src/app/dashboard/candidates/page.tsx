'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import {
    Users,
    Search,
    Mail,
    Calendar,
    User,
    Shield
} from 'lucide-react';

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();

    useEffect(() => {
        loadCandidates();
    }, []);

    const loadCandidates = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'candidate')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCandidates(data);
        }
        setLoading(false);
    };

    const promoteToInterviewer = async (id: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: 'interviewer', interviewer_status: 'offline' })
            .eq('id', id);

        if (!error) {
            loadCandidates();
        }
    };

    const filteredCandidates = candidates.filter(candidate =>
        candidate.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <h1 className="text-2xl font-bold text-white mb-1">Kandidat</h1>
                <p className="text-slate-400">Daftar semua kandidat yang terdaftar</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{candidates.length}</p>
                            <p className="text-sm text-slate-400">Total Kandidat</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12"
                />
            </div>

            {/* Candidates Table */}
            <div className="glass-card overflow-hidden">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Kandidat</th>
                                <th>Email</th>
                                <th>Terdaftar</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.map((candidate) => (
                                <motion.tr
                                    key={candidate.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                {candidate.full_name?.charAt(0) || 'C'}
                                            </div>
                                            <span className="font-medium text-white">
                                                {candidate.full_name || 'Kandidat'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Mail className="w-4 h-4" />
                                            {candidate.email || '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(candidate.created_at).toLocaleDateString('id-ID')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => promoteToInterviewer(candidate.id)}
                                                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Jadikan Interviewer
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredCandidates.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-400">
                                        {searchQuery ? 'Tidak ada kandidat yang cocok' : 'Belum ada kandidat'}
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
