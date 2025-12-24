'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserButton } from '@clerk/nextjs';
import {
    useQueue,
    useActiveSession,
    requestNextCandidate,
    completeInterviewSession
} from '@/lib/hooks';
import type { Profile, ScoreSummary, Application } from '@/types';

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
    const [technicalNote, setTechnicalNote] = useState('');
    const [communicationNote, setCommunicationNote] = useState('');
    const [attitudeNote, setAttitudeNote] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [interviewTime, setInterviewTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [flagForReview, setFlagForReview] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer effect
    useEffect(() => {
        if (activeApp && !isPaused) {
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
    }, [activeApp, isPaused]);

    // Reset when no active session
    useEffect(() => {
        if (!activeApp) {
            setInterviewTime(0);
            setLocalScores({ technical: 0, communication: 0, attitude: 0, notes: '' });
            setTechnicalNote('');
            setCommunicationNote('');
            setAttitudeNote('');
            setInternalNotes('');
            setFlagForReview(false);
        }
    }, [activeApp]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getRemainingTime = (): string => {
        const totalSeconds = 45 * 60; // 45 minutes
        const remaining = Math.max(0, totalSeconds - interviewTime);
        return formatTime(remaining);
    };

    const getTimerProgress = (): number => {
        const totalSeconds = 45 * 60;
        const progress = Math.min(interviewTime / totalSeconds, 1);
        return 251.2 * (1 - progress); // strokeDashoffset calculation
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
        const combinedNotes = `${internalNotes}\n\n---\nTechnical: ${technicalNote}\nCommunication: ${communicationNote}\nAttitude: ${attitudeNote}${flagForReview ? '\n\n⚠️ FLAGGED FOR REVIEW' : ''}`;

        const result = await completeInterviewSession(
            activeApp.id,
            profile.id,
            interviewTime,
            { ...localScores, notes: combinedNotes }
        );

        if (result.status === 'success') {
            notify("Sesi wawancara selesai!");
        } else {
            notify(result.message || "Gagal menyimpan sesi.");
        }
        setProcessing(false);
    };

    const handlePassCandidate = async () => {
        if (!activeApp) return;
        // For now, just complete with current scores
        await handleCompleteSession();
    };

    const addTime = () => {
        // This would extend the timer by 5 minutes
        // For now, just a placeholder
        notify("Waktu ditambah 5 menit");
    };

    const getWaitingTime = (checkedInAt: string | null): string => {
        if (!checkedInAt) return '';
        const checkedIn = new Date(checkedInAt);
        const now = new Date();
        const diffMs = now.getTime() - checkedIn.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        return `${diffMins}m`;
    };

    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#3636e2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f6f6f8] text-slate-900 font-sans h-screen flex overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#3636e2] to-blue-400 flex items-center justify-center text-white shadow-lg shadow-[#3636e2]/30">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.781 0-4.781 8 0 8 5.606 0 7.644-8 12.74-8z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-none tracking-tight">RecruitFlow</h1>
                        <p className="text-xs text-slate-500 mt-1">Interviewer Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#3636e2]/10 text-[#3636e2]" href="#">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        <span className="text-sm font-medium">Dashboard</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className="text-sm font-medium">Candidates</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 20V10" />
                            <path d="M12 20V4" />
                            <path d="M6 20v-6" />
                        </svg>
                        <span className="text-sm font-medium">Analytics</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span className="text-sm font-medium">Settings</span>
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col">
                            <p className="text-sm font-medium leading-none">{profile.full_name || 'Interviewer'}</p>
                            <p className="text-xs text-slate-500 mt-1">Senior Recruiter</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Layout Container for Queue and Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Queue Sidebar (Middle Column) */}
                <div className="w-80 flex-shrink-0 bg-[#f6f6f8] border-r border-slate-200 flex flex-col hidden lg:flex">
                    <div className="p-5 pb-2">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Today's Queue
                            <span className="bg-[#3636e2]/10 text-[#3636e2] text-xs px-2 py-0.5 rounded-full font-bold">
                                {queue.length}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Next up for interview</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
                        {/* Active Item (Current) */}
                        {activeApp && (
                            <div className="p-3 bg-white rounded-xl shadow-sm border-l-4 border-[#3636e2] ring-1 ring-slate-200">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-[#3636e2] font-bold">
                                        {activeApp.candidate?.full_name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {activeApp.candidate?.full_name || 'Kandidat'}
                                        </p>
                                        <p className="text-xs text-[#3636e2] font-medium mt-0.5">Interviewing Now</p>
                                    </div>
                                    <span className="relative flex h-2.5 w-2.5 mt-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3636e2] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3636e2]"></span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Waiting Items */}
                        {queue.map((app, index) => (
                            <div key={app.id} className="p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group">
                                <div className="flex items-start gap-3">
                                    <div className={`h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-600 font-medium ${index >= 2 ? 'opacity-60' : 'opacity-80'}`}>
                                        {app.candidate?.full_name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-[#3636e2] transition-colors">
                                            {app.candidate?.full_name || 'Kandidat'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Waiting {getWaitingTime(app.checked_in_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-600 mt-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {queue.length === 0 && !activeApp && (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No candidates in queue</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200">
                        <button className="w-full py-2 px-4 border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-[#3636e2] hover:text-[#3636e2] transition-all flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Walk-in
                        </button>
                    </div>
                </div>

                {/* Main Active Interview Workspace */}
                <main className="flex-1 flex flex-col h-full bg-[#f6f6f8] overflow-hidden relative">
                    {activeApp ? (
                        <>
                            {/* Header */}
                            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-slate-200 shadow-inner flex items-center justify-center text-[#3636e2] text-xl font-bold">
                                        {activeApp.candidate?.full_name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Interviewing: {activeApp.candidate?.full_name || 'Kandidat'}
                                            </h2>
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                                                Live
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {activeApp.job?.title || 'Position'} Candidate
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10 9 9 9 8 9" />
                                        </svg>
                                        View Resume
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        History
                                    </button>
                                </div>
                            </header>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 pb-24">
                                <div className="max-w-5xl mx-auto flex flex-col gap-6">
                                    {/* Timer & Controls */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#3636e2]"></div>
                                        <div className="flex flex-col md:flex-row items-center gap-6 z-10">
                                            <div className="relative flex items-center justify-center">
                                                {/* Decorative Timer Ring */}
                                                <svg className="w-24 h-24 transform -rotate-90">
                                                    <circle
                                                        className="text-slate-100"
                                                        cx="48" cy="48" fill="transparent" r="40"
                                                        stroke="currentColor" strokeWidth="6"
                                                    />
                                                    <circle
                                                        className="text-[#3636e2] transition-all duration-1000 ease-linear"
                                                        cx="48" cy="48" fill="transparent" r="40"
                                                        stroke="currentColor"
                                                        strokeDasharray="251.2"
                                                        strokeDashoffset={getTimerProgress()}
                                                        strokeWidth="6"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-bold font-mono text-slate-900 tracking-tighter">
                                                        {getRemainingTime()}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                        Remaining
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-lg font-semibold text-slate-900">Technical Deep Dive</h3>
                                                <p className="text-sm text-slate-500">Current Phase • Planned duration: 45 min</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 z-10">
                                            <button
                                                onClick={() => setIsPaused(!isPaused)}
                                                className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                title={isPaused ? "Resume Timer" : "Pause Timer"}
                                            >
                                                {isPaused ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <polygon points="5 3 19 12 5 21 5 3" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <rect x="6" y="4" width="4" height="16" />
                                                        <rect x="14" y="4" width="4" height="16" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={addTime}
                                                className="h-10 px-4 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                                                title="Add Time"
                                            >
                                                + 5m
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scoring Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Technical Skill Card */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <polyline points="16 18 22 12 16 6" />
                                                        <polyline points="8 6 2 12 8 18" />
                                                    </svg>
                                                    Technical Skill
                                                </div>
                                                <span className="text-sm font-bold text-[#3636e2]">{localScores.technical}/5</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setLocalScores({ ...localScores, technical: num })}
                                                        className={`hover:scale-110 transition-transform ${localScores.technical >= num ? 'text-[#3636e2]' : 'text-slate-300 hover:text-[#3636e2]'}`}
                                                    >
                                                        <svg className="w-6 h-6" fill={localScores.technical >= num ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full mt-2 text-xs p-2 bg-[#f6f6f8] rounded border border-transparent focus:border-[#3636e2] focus:ring-0 resize-none text-slate-600"
                                                placeholder="Note on technical ability..."
                                                rows={2}
                                                value={technicalNote}
                                                onChange={(e) => setTechnicalNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Communication Card */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                    Communication
                                                </div>
                                                <span className="text-sm font-bold text-slate-400">{localScores.communication}/5</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setLocalScores({ ...localScores, communication: num })}
                                                        className={`hover:scale-110 transition-transform ${localScores.communication >= num ? 'text-[#3636e2]' : 'text-slate-300 hover:text-[#3636e2]'}`}
                                                    >
                                                        <svg className="w-6 h-6" fill={localScores.communication >= num ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full mt-2 text-xs p-2 bg-[#f6f6f8] rounded border border-transparent focus:border-[#3636e2] focus:ring-0 resize-none text-slate-600"
                                                placeholder="Note on communication..."
                                                rows={2}
                                                value={communicationNote}
                                                onChange={(e) => setCommunicationNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Attitude Card */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                                    </svg>
                                                    Attitude
                                                </div>
                                                <span className="text-sm font-bold text-slate-400">{localScores.attitude}/5</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setLocalScores({ ...localScores, attitude: num })}
                                                        className={`hover:scale-110 transition-transform ${localScores.attitude >= num ? 'text-[#3636e2]' : 'text-slate-300 hover:text-[#3636e2]'}`}
                                                    >
                                                        <svg className="w-6 h-6" fill={localScores.attitude >= num ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full mt-2 text-xs p-2 bg-[#f6f6f8] rounded border border-transparent focus:border-[#3636e2] focus:ring-0 resize-none text-slate-600"
                                                placeholder="Note on attitude..."
                                                rows={2}
                                                value={attitudeNote}
                                                onChange={(e) => setAttitudeNote(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Internal Notes */}
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                                Internal Notes
                                            </h3>
                                            <span className="text-xs text-slate-400">Auto-saved</span>
                                        </div>
                                        <div className="p-4">
                                            <textarea
                                                className="w-full h-40 bg-transparent border-0 focus:ring-0 p-0 text-slate-700 placeholder:text-slate-400 leading-relaxed resize-none"
                                                placeholder="Type your detailed assessment notes here. These will be shared with the hiring committee. Focus on key strengths, weaknesses, and specific project examples discussed during the interview..."
                                                value={internalNotes}
                                                onChange={(e) => setInternalNotes(e.target.value)}
                                            />
                                        </div>
                                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-2">
                                            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500" title="Bold">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                                                    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                                                </svg>
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500" title="Italic">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <line x1="19" y1="4" x2="10" y2="4" />
                                                    <line x1="14" y1="20" x2="5" y2="20" />
                                                    <line x1="15" y1="4" x2="9" y2="20" />
                                                </svg>
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500" title="List">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <line x1="8" y1="6" x2="21" y2="6" />
                                                    <line x1="8" y1="12" x2="21" y2="12" />
                                                    <line x1="8" y1="18" x2="21" y2="18" />
                                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Action Footer */}
                            <footer className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-lg z-20">
                                <div className="max-w-5xl mx-auto flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={flagForReview}
                                                onChange={(e) => setFlagForReview(e.target.checked)}
                                                className="rounded border-slate-300 text-[#3636e2] focus:ring-[#3636e2] h-4 w-4"
                                            />
                                            Flag for review
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handlePassCandidate}
                                            disabled={processing}
                                            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                                        >
                                            Pass Candidate
                                        </button>
                                        <button
                                            onClick={handleCompleteSession}
                                            disabled={processing}
                                            className="px-6 py-2.5 rounded-xl bg-[#3636e2] text-white font-medium text-sm hover:bg-blue-700 shadow-lg shadow-[#3636e2]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                    Save & End Session
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </footer>
                        </>
                    ) : (
                        /* Empty State - No Active Session */
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center max-w-md">
                                <div className="w-24 h-24 mx-auto mb-6 bg-[#3636e2]/10 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-[#3636e2]" fill="currentColor" viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready for Next Interview?</h2>
                                <p className="text-slate-500 mb-8">
                                    {queue.length > 0
                                        ? `There are ${queue.length} candidate(s) waiting in the queue.`
                                        : 'No candidates in the queue yet. They will appear here once they check in.'
                                    }
                                </p>
                                <button
                                    onClick={handleNextCandidate}
                                    disabled={processing || queue.length === 0}
                                    className="px-8 py-4 bg-[#3636e2] text-white font-bold rounded-2xl shadow-xl shadow-[#3636e2]/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                                >
                                    {processing ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <polyline points="17 11 19 13 23 9" />
                                            </svg>
                                            Call Next Candidate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
