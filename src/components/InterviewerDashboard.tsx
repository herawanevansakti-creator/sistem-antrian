'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserButton } from '@clerk/nextjs';
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
    const [scores, setScores] = useState({ technical: 0, communication: 0, attitude: 0 });
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
            setScores({ technical: 0, communication: 0, attitude: 0 });
            setTechnicalNote('');
            setCommunicationNote('');
            setAttitudeNote('');
            setInternalNotes('');
            setFlagForReview(false);
        }
    }, [activeApp]);

    const getRemainingTime = (): string => {
        const totalSeconds = 45 * 60; // 45 minutes
        const remaining = Math.max(0, totalSeconds - interviewTime);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for SVG ring (0-251.2)
    const getProgressOffset = (): number => {
        const totalSeconds = 45 * 60;
        const progress = Math.min(interviewTime / totalSeconds, 1);
        return 251.2 * (1 - progress);
    };

    const handleNextCandidate = async () => {
        setProcessing(true);
        const result = await requestNextCandidate(profile.id);

        if (result.status === 'success') {
            notify("Kandidat dipanggil!");
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
            { ...scores, notes: combinedNotes }
        );

        if (result.status === 'success') {
            notify("Sesi wawancara selesai!");
        } else {
            notify(result.message || "Gagal menyimpan sesi.");
        }
        setProcessing(false);
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

    // Star Rating Component
    const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
                <button
                    key={num}
                    onClick={() => onChange(num)}
                    className={`hover:scale-110 transition-transform ${value >= num ? 'text-[#3636e2]' : 'text-slate-300 dark:text-slate-700 hover:text-[#3636e2]'}`}
                >
                    <span className={`material-symbols-outlined ${value >= num ? 'filled' : ''}`}>star</span>
                </button>
            ))}
        </div>
    );

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
        <div className="bg-[#f6f6f8] text-slate-900 font-[Inter,sans-serif] h-screen flex overflow-hidden selection:bg-[#3636e2]/20">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#3636e2] to-blue-400 flex items-center justify-center text-white shadow-lg shadow-[#3636e2]/30">
                        <span className="material-symbols-outlined text-2xl">all_inclusive</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-none tracking-tight">RecruitFlow</h1>
                        <p className="text-xs text-slate-500 mt-1">Interviewer Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#3636e2]/10 text-[#3636e2]" href="#">
                        <span className="material-symbols-outlined filled">dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-sm font-medium">Candidates</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <span className="material-symbols-outlined">bar_chart</span>
                        <span className="text-sm font-medium">Analytics</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <span className="material-symbols-outlined">settings</span>
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
                <div className="w-80 flex-shrink-0 bg-[#f6f6f8] border-r border-slate-200 flex-col hidden lg:flex">
                    <div className="p-5 pb-2">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Today's Queue
                            <span className="bg-[#3636e2]/10 text-[#3636e2] text-xs px-2 py-0.5 rounded-full font-bold">
                                {queue.length + (activeApp ? 1 : 0)}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {activeApp ? 'Now interviewing' : queue.length > 0 ? 'Next up for interview' : 'No candidates waiting'}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
                        {/* Active Item (Current) */}
                        {activeApp && (
                            <div className="p-3 bg-white rounded-xl shadow-sm border-l-4 border-[#3636e2] ring-1 ring-slate-200">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3636e2] to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold">
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
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 opacity-80 flex items-center justify-center text-slate-600 font-medium">
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
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {queue.length === 0 && !activeApp && (
                            <div className="text-center py-8 text-slate-400 text-xs">
                                No candidates in queue
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200">
                        <button className="w-full py-2 px-4 border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-[#3636e2] hover:text-[#3636e2] transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">add</span>
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
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[#3636e2] text-xl font-bold shadow-inner">
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
                                            {activeApp.job?.title || 'Position'} Candidate • {activeApp.queue_number || 'Queue'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                                        <span className="material-symbols-outlined text-lg">description</span>
                                        View Resume
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                                        <span className="material-symbols-outlined text-lg">history</span>
                                        History
                                    </button>
                                </div>
                            </header>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 pb-24">
                                <div className="max-w-5xl mx-auto flex flex-col gap-6">
                                    {/* Timer & Controls */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#3636e2]"></div>
                                        <div className="flex flex-col md:flex-row items-center gap-6 z-10">
                                            <div className="relative flex items-center justify-center">
                                                {/* Decorative Timer Ring */}
                                                <svg className="w-24 h-24 transform -rotate-90">
                                                    <circle
                                                        className="text-slate-100"
                                                        cx="48"
                                                        cy="48"
                                                        fill="transparent"
                                                        r="40"
                                                        stroke="currentColor"
                                                        strokeWidth="6"
                                                    />
                                                    <circle
                                                        className="text-[#3636e2] transition-all duration-1000 ease-linear"
                                                        cx="48"
                                                        cy="48"
                                                        fill="transparent"
                                                        r="40"
                                                        stroke="currentColor"
                                                        strokeDasharray="251.2"
                                                        strokeDashoffset={getProgressOffset()}
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
                                                <span className="material-symbols-outlined">{isPaused ? 'play_arrow' : 'pause'}</span>
                                            </button>
                                            <button
                                                onClick={() => notify("Waktu ditambah 5 menit")}
                                                className="h-10 px-4 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                                                title="Add Time"
                                            >
                                                + 5m
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scoring Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Card 1 - Technical Skill */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <span className="material-symbols-outlined text-blue-500">code</span>
                                                    Technical Skill
                                                </div>
                                                <span className={`text-sm font-bold ${scores.technical > 0 ? 'text-[#3636e2]' : 'text-slate-400'}`}>
                                                    {scores.technical}/5
                                                </span>
                                            </div>
                                            <StarRating value={scores.technical} onChange={(v) => setScores({ ...scores, technical: v })} />
                                            <textarea
                                                className="w-full mt-2 text-xs p-2 bg-[#f6f6f8] rounded border border-transparent focus:border-[#3636e2] focus:ring-0 resize-none text-slate-600"
                                                placeholder="Note on technical ability..."
                                                rows={2}
                                                value={technicalNote}
                                                onChange={(e) => setTechnicalNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Card 2 - Communication */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <span className="material-symbols-outlined text-purple-500">record_voice_over</span>
                                                    Communication
                                                </div>
                                                <span className={`text-sm font-bold ${scores.communication > 0 ? 'text-[#3636e2]' : 'text-slate-400'}`}>
                                                    {scores.communication}/5
                                                </span>
                                            </div>
                                            <StarRating value={scores.communication} onChange={(v) => setScores({ ...scores, communication: v })} />
                                            <textarea
                                                className="w-full mt-2 text-xs p-2 bg-[#f6f6f8] rounded border border-transparent focus:border-[#3636e2] focus:ring-0 resize-none text-slate-600"
                                                placeholder="Note on communication..."
                                                rows={2}
                                                value={communicationNote}
                                                onChange={(e) => setCommunicationNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Card 3 - Attitude */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <span className="material-symbols-outlined text-green-500">sentiment_satisfied</span>
                                                    Attitude
                                                </div>
                                                <span className={`text-sm font-bold ${scores.attitude > 0 ? 'text-[#3636e2]' : 'text-slate-400'}`}>
                                                    {scores.attitude}/5
                                                </span>
                                            </div>
                                            <StarRating value={scores.attitude} onChange={(v) => setScores({ ...scores, attitude: v })} />
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
                                                <span className="material-symbols-outlined text-slate-400">edit_note</span>
                                                Internal Notes
                                            </h3>
                                            <span className="text-xs text-slate-400">Auto-saved 2m ago</span>
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
                                                <span className="material-symbols-outlined text-lg">format_bold</span>
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500" title="Italic">
                                                <span className="material-symbols-outlined text-lg">format_italic</span>
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500" title="List">
                                                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
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
                                            onClick={handleCompleteSession}
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
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    Save & End Session
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </footer>
                        </>
                    ) : (
                        /* Empty State - Ready for Interview */
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center max-w-md">
                                <div className="w-24 h-24 mx-auto mb-6 bg-[#3636e2]/10 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-[#3636e2]">play_circle</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready for Next Interview?</h2>
                                <p className="text-slate-500 text-sm mb-8">
                                    {queue.length > 0
                                        ? `There are ${queue.length} candidate(s) waiting in the queue.`
                                        : 'No candidates in the queue yet. They will appear here once they check in.'
                                    }
                                </p>
                                <button
                                    onClick={handleNextCandidate}
                                    disabled={processing || queue.length === 0}
                                    className="px-8 py-3 bg-[#3636e2] text-white font-bold rounded-2xl shadow-xl shadow-[#3636e2]/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                >
                                    {processing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">group_add</span>
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
