'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
    Play,
    Pause,
    Coffee,
    LogOut,
    UserCheck,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { InterviewerState, RequestNextCandidateResponse } from '@/types';

interface InterviewerControlsProps {
    currentStatus: InterviewerState;
    onStatusChange: (status: InterviewerState) => void;
    onCandidateAssigned?: (applicationId: number) => void;
}

export default function InterviewerControls({
    currentStatus,
    onStatusChange,
    onCandidateAssigned
}: InterviewerControlsProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const updateStatus = async (newStatus: InterviewerState) => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ interviewer_status: newStatus })
                .eq('id', user.id);

            if (error) throw error;

            onStatusChange(newStatus);
            toast.success(`Status diubah ke ${getStatusLabel(newStatus)}`);
        } catch (error) {
            toast.error('Gagal mengubah status');
            console.error(error);
        }
        setLoading(false);
    };

    const requestNextCandidate = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .rpc('request_next_candidate', {
                    interviewer_id_input: user.id
                }) as { data: RequestNextCandidateResponse | null, error: Error | null };

            if (error) throw error;

            if (data?.status === 'success' && data.application_id) {
                toast.success('Kandidat ditemukan!');
                onStatusChange('busy');
                onCandidateAssigned?.(data.application_id);
            } else {
                toast.info(data?.message || 'Tidak ada antrean saat ini');
            }
        } catch (error) {
            toast.error('Gagal meminta kandidat');
            console.error(error);
        }
        setLoading(false);
    };

    const getStatusLabel = (status: InterviewerState) => {
        const labels: Record<InterviewerState, string> = {
            offline: 'Offline',
            idle: 'Siap',
            busy: 'Sibuk',
            break: 'Istirahat'
        };
        return labels[status];
    };

    const getStatusColor = (status: InterviewerState) => {
        const colors: Record<InterviewerState, string> = {
            offline: 'bg-slate-500',
            idle: 'bg-green-500',
            busy: 'bg-orange-500',
            break: 'bg-yellow-500'
        };
        return colors[status];
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Panel Kontrol</h2>
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)} animate-pulse`} />
                    <span className="text-sm text-slate-400">{getStatusLabel(currentStatus)}</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Ready Button - Main Action */}
                {currentStatus !== 'busy' && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={requestNextCandidate}
                        disabled={loading || currentStatus === 'offline'}
                        className={`
              w-full py-4 rounded-xl font-semibold text-lg
              flex items-center justify-center gap-3
              transition-all duration-300
              ${currentStatus === 'offline'
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'btn-primary'
                            }
            `}
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <UserCheck className="w-6 h-6" />
                                Saya Siap - Panggil Kandidat
                            </>
                        )}
                    </motion.button>
                )}

                {/* Status Controls */}
                <div className="grid grid-cols-2 gap-3">
                    {currentStatus === 'offline' ? (
                        <button
                            onClick={() => updateStatus('idle')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
                        >
                            <Play className="w-5 h-5" />
                            <span>Go Online</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => updateStatus('offline')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-600/50 text-slate-300 border border-slate-500/30 hover:bg-slate-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Offline</span>
                        </button>
                    )}

                    {currentStatus !== 'break' ? (
                        <button
                            onClick={() => updateStatus('break')}
                            disabled={loading || currentStatus === 'offline'}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                        >
                            <Coffee className="w-5 h-5" />
                            <span>Istirahat</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => updateStatus('idle')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Kembali</span>
                        </button>
                    )}
                </div>

                {/* Current Session Info */}
                {currentStatus === 'busy' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30"
                    >
                        <p className="text-sm text-orange-400 font-medium mb-1">
                            Sesi Wawancara Aktif
                        </p>
                        <p className="text-xs text-slate-400">
                            Klik tombol di bawah setelah wawancara selesai
                        </p>
                        <button
                            onClick={() => updateStatus('idle')}
                            disabled={loading}
                            className="mt-3 w-full py-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors text-sm font-medium"
                        >
                            Selesai Wawancara
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
