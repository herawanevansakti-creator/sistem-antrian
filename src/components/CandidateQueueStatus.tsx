'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Application } from '@/types';
import {
    Bell,
    CheckCircle2,
    Clock,
    MapPin,
    ArrowRight,
    Volume2,
    VolumeX
} from 'lucide-react';

export default function CandidateQueueStatus() {
    const { user } = useUser();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNotified, setIsNotified] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const supabase = createClient();

    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return;

        // Create audio context for notification sound
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }, [soundEnabled]);

    useEffect(() => {
        if (user?.id) {
            loadApplication();
            setupRealtimeSubscription();
        }

        return () => {
            supabase.removeAllChannels();
        };
    }, [user?.id]);

    const loadApplication = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from('applications')
            .select(`
        *,
        job:jobs!job_id(id, title)
      `)
            .eq('candidate_id', user.id)
            .in('status', ['waiting', 'assigned', 'interviewing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!error && data) {
            setApplication(data);
            calculateQueuePosition(data);
        }
        setLoading(false);
    };

    const calculateQueuePosition = async (app: Application) => {
        if (app.status !== 'waiting' || !app.checked_in_at) {
            setQueuePosition(null);
            return;
        }

        const { count, error } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'waiting')
            .lt('checked_in_at', app.checked_in_at);

        if (!error && count !== null) {
            setQueuePosition(count + 1);
        }
    };

    const setupRealtimeSubscription = () => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`candidate-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'applications',
                    filter: `candidate_id=eq.${user.id}`,
                },
                (payload) => {
                    const newApp = payload.new as Application;
                    setApplication(prev => ({ ...prev, ...newApp }));

                    if (newApp.status === 'assigned' && !isNotified) {
                        setIsNotified(true);
                        playNotificationSound();

                        // Browser notification
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('Giliran Anda!', {
                                body: 'Silakan menuju ruang wawancara',
                                icon: '/favicon.ico'
                            });
                        }
                    }
                }
            )
            .subscribe();
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    const handleCheckIn = async () => {
        if (!application) return;

        const { error } = await supabase
            .from('applications')
            .update({
                status: 'waiting',
                checked_in_at: new Date().toISOString()
            })
            .eq('id', application.id);

        if (!error) {
            loadApplication();
        }
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
                <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                    Belum Ada Lamaran Aktif
                </h2>
                <p className="text-slate-400 mb-6">
                    Anda belum memiliki lamaran yang sedang dalam proses wawancara
                </p>
                <a href="/dashboard/apply" className="btn-primary inline-flex items-center gap-2">
                    Lihat Lowongan
                    <ArrowRight className="w-5 h-5" />
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sound Toggle */}
            <div className="flex justify-end">
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                    {soundEnabled ? (
                        <>
                            <Volume2 className="w-5 h-5" />
                            <span className="text-sm">Suara Aktif</span>
                        </>
                    ) : (
                        <>
                            <VolumeX className="w-5 h-5" />
                            <span className="text-sm">Suara Mati</span>
                        </>
                    )}
                </button>
            </div>

            {/* Main Status Card */}
            <AnimatePresence mode="wait">
                {application.status === 'registered' && (
                    <motion.div
                        key="registered"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card p-8 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-12 h-12 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Sudah Sampai di Lokasi?
                        </h2>
                        <p className="text-slate-400 mb-6">
                            Klik tombol di bawah untuk masuk ke antrean wawancara
                        </p>
                        <button
                            onClick={handleCheckIn}
                            className="btn-primary text-lg px-8 py-4"
                        >
                            <CheckCircle2 className="w-6 h-6 mr-2 inline" />
                            Saya Sudah Sampai (Check-in)
                        </button>
                    </motion.div>
                )}

                {application.status === 'waiting' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card p-8 text-center"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" />
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 flex items-center justify-center border-2 border-yellow-500/50">
                                <Clock className="w-16 h-16 text-yellow-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Menunggu Giliran
                        </h2>

                        {queuePosition && (
                            <div className="my-6">
                                <p className="text-sm text-slate-400 mb-2">Posisi Antrean Anda</p>
                                <div className="queue-number">{queuePosition}</div>
                            </div>
                        )}

                        <p className="text-slate-400">
                            Tetap di halaman ini. Anda akan menerima notifikasi saat giliran tiba.
                        </p>

                        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <p className="text-sm text-slate-400">
                                <Bell className="w-4 h-4 inline mr-2" />
                                Pastikan notifikasi browser Anda aktif
                            </p>
                        </div>
                    </motion.div>
                )}

                {application.status === 'assigned' && (
                    <motion.div
                        key="assigned"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card p-8 text-center animate-pulse-glow"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-500/30 to-green-600/30 flex items-center justify-center border-2 border-green-500/50">
                                <CheckCircle2 className="w-16 h-16 text-green-400" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">
                            🎉 Giliran Anda!
                        </h2>

                        <p className="text-xl text-green-400 font-semibold mb-6">
                            Silakan menuju ruang wawancara
                        </p>

                        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30">
                            <p className="text-lg text-white font-medium mb-2">
                                {application.job?.title}
                            </p>
                            <p className="text-sm text-slate-400">
                                Nomor Antrean: {application.queue_number || '-'}
                            </p>
                        </div>
                    </motion.div>
                )}

                {application.status === 'interviewing' && (
                    <motion.div
                        key="interviewing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card p-8 text-center"
                    >
                        <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 animate-float">
                            <div className="text-6xl">💬</div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Wawancara Berlangsung
                        </h2>

                        <p className="text-slate-400">
                            Semoga sukses dengan wawancara Anda!
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Job Info */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Informasi Lamaran
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Posisi</span>
                        <span className="text-white font-medium">{application.job?.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Nomor Antrean</span>
                        <span className="text-white font-medium">{application.queue_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Check-in</span>
                        <span className="text-white font-medium">
                            {application.checked_in_at
                                ? new Date(application.checked_in_at).toLocaleTimeString('id-ID')
                                : 'Belum check-in'
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
