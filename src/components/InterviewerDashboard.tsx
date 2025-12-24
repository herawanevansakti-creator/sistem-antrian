'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserButton } from '@clerk/nextjs';
import {
    Play,
    BarChart3,
    Star,
    Bell,
    LogOut,
    TrendingUp
} from 'lucide-react';
import {
    useQueue,
    useActiveSession,
    requestNextCandidate,
    completeInterviewSession
} from '@/lib/hooks';
import type { Profile, ScoreSummary } from '@/types';

interface InterviewerDashboardProps {
    profile: Profile;
    notify: (msg: string) => void;
}

export default function InterviewerDashboard({ profile, notify }: InterviewerDashboardProps) {
    const { activeApp, loading: sessionLoading } = useActiveSession(profile.id);
    const { queue } = useQueue();

    // State
    const [localScores, setLocalScores] = useState<ScoreSummary>({
        technical: 0,
        communication: 0,
        attitude: 0,
        notes: ''
    });
    const [processing, setProcessing] = useState(false);
    const [interviewTime, setInterviewTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer effect
    useEffect(() => {
        if (activeApp) {
            timerRef.current = setInterval(() => {
                setInterviewTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [activeApp]);

    // Reset when no active session
    useEffect(() => {
        if (!activeApp) {
            setInterviewTime(0);
            setLocalScores({ technical: 0, communication: 0, attitude: 0, notes: '' });
        }
    }, [activeApp]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNextCandidate = async () => {
        setProcessing(true);
        const result = await requestNextCandidate(profile.id);

        if (result.status === 'success') {
            notify("Kandidat dipanggil! Silakan mulai wawancara.");
            setInterviewTime(0);
        } else {
            notify(result.message || "Tidak ada antrean.");
        }
        setProcessing(false);
    };

    const handleCompleteSession = async () => {
        if (!activeApp) return;

        setProcessing(true);
        const result = await completeInterviewSession(
            activeApp.id,
            profile.id,
            interviewTime,
            localScores
        );

        if (result.status === 'success') {
            notify("Hasil disimpan & Sesi berakhir.");
        } else {
            notify(result.message || "Gagal menyimpan sesi.");
        }
        setProcessing(false);
    };

    // Star Rating Component
    const StarRating = ({
        label,
        value,
        onChange
    }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
    }) => (
        <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                        key={num}
                        onClick={() => onChange(num)}
                        className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform ${value >= num ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                            }`}
                    />
                ))}
            </div>
        </div>
    );

    // Navbar Component
    const Navbar = () => (
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="bg-[#3636e2] p-2 rounded-xl shadow-lg shadow-[#3636e2]/20">
                    <TrendingUp className="text-white w-5 h-5" />
                </div>
                <span className="font-black text-xl tracking-tighter text-[#0e0e1b]">RECRUITFLOW</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                    <p className="text-sm font-bold leading-none">{profile?.full_name}</p>
                    <span className="text-[10px] font-black text-[#3636e2] uppercase">{profile?.role}</span>
                </div>
                <UserButton afterSignOutUrl="/" />
            </div>
        </nav>
    );

    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#3636e2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Workspace (2/3 width) */}
                <div className="lg:col-span-2">
                    {!activeApp ? (
                        /* Empty State - No Active Session */
                        <div className="bg-white h-[500px] rounded-[40px] flex flex-col items-center justify-center p-12 text-center space-y-6 shadow-sm border border-gray-100">
                            <div className="bg-[#3636e2]/10 p-6 rounded-full">
                                <Play className="w-12 h-12 text-[#3636e2] fill-current" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-800">Sesi Berikutnya?</h2>
                                <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                                    {queue.length > 0
                                        ? `Ada ${queue.length} kandidat menunggu di antrean.`
                                        : 'Pastikan Anda sudah siap secara teknis sebelum memanggil kandidat.'
                                    }
                                </p>
                            </div>
                            <button
                                onClick={handleNextCandidate}
                                disabled={processing || queue.length === 0}
                                className="bg-[#3636e2] text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-[#3636e2]/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Memanggil...
                                    </span>
                                ) : (
                                    'Panggil Sekarang'
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Active Interview Session */
                        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full">
                            {/* TIMER HEADER */}
                            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                                <div>
                                    <span className="text-[#3636e2] text-[10px] font-black uppercase tracking-widest">Sesi Berlangsung</span>
                                    <h2 className="text-3xl font-black">
                                        {activeApp.candidate?.full_name || activeApp.queue_number || 'Kandidat'}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#3636e2] text-[10px] font-black uppercase tracking-widest">Durasi Wawancara</p>
                                    <p className="text-4xl font-mono font-black text-green-400">{formatTime(interviewTime)}</p>
                                </div>
                            </div>

                            {/* SCORING CONTENT */}
                            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest">Penilaian</h3>
                                        <div className="space-y-6">
                                            <StarRating
                                                label="Technical Skill"
                                                value={localScores.technical}
                                                onChange={(v) => setLocalScores({ ...localScores, technical: v })}
                                            />
                                            <StarRating
                                                label="Communication"
                                                value={localScores.communication}
                                                onChange={(v) => setLocalScores({ ...localScores, communication: v })}
                                            />
                                            <StarRating
                                                label="Attitude"
                                                value={localScores.attitude}
                                                onChange={(v) => setLocalScores({ ...localScores, attitude: v })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest">Internal Notes</h3>
                                        <textarea
                                            className="w-full h-48 bg-slate-50 border-2 border-gray-100 rounded-3xl p-5 outline-none focus:border-[#3636e2] transition-all text-sm resize-none"
                                            placeholder="Feedback teknis..."
                                            value={localScores.notes}
                                            onChange={(e) => setLocalScores({ ...localScores, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ACTION FOOTER */}
                            <div className="p-8 bg-gray-50 border-t">
                                <button
                                    onClick={handleCompleteSession}
                                    disabled={processing}
                                    className="w-full py-5 bg-[#3636e2] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#3636e2]/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        'Simpan & Akhiri Sesi'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Queue Sidebar (1/3 width) */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#3636e2]" /> Antrean Hari Ini
                        </h3>
                        <div className="space-y-4">
                            {queue.map(app => (
                                <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white w-10 h-10 flex items-center justify-center rounded-xl font-black text-[#3636e2] shadow-sm border border-[#3636e2]/10">
                                            {app.queue_number || '#'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{app.candidate?.full_name || 'Kandidat'}</p>
                                            <span className="text-xs font-bold text-gray-400">
                                                {app.checked_in_at
                                                    ? new Date(app.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : '--:--'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded-lg">
                                        Waiting
                                    </span>
                                </div>
                            ))}
                            {queue.length === 0 && (
                                <p className="text-center text-gray-400 text-xs py-4">Belum ada antrean baru.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
