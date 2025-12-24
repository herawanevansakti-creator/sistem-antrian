'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserButton } from '@clerk/nextjs';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    Play,
    Pause,
    Plus,
    FileText,
    Clock,
    CheckCircle,
    Star,
    Bold,
    Italic,
    List,
    Flag,
    Check
} from 'lucide-react';
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

    const addTime = () => {
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
            {/* Left Sidebar Navigation */}
            <aside className="w-56 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 z-20">
                {/* Logo */}
                <div className="p-5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#3636e2] to-blue-400 flex items-center justify-center text-white shadow-lg shadow-[#3636e2]/30">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.781 0-4.781 8 0 8 5.606 0 7.644-8 12.74-8z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold leading-none tracking-tight">RecruitFlow</h1>
                        <p className="text-[10px] text-slate-500 mt-0.5">Interviewer Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 flex flex-col gap-1 mt-2">
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#3636e2]/10 text-[#3636e2]" href="#">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Candidates</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm font-medium">Analytics</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                    </a>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-medium leading-none truncate">{profile.full_name || 'Interviewer'}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Senior Recruiter</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Queue Panel (Middle) */}
            <div className="w-72 flex-shrink-0 bg-[#f6f6f8] border-r border-slate-200 flex flex-col">
                {/* Queue Header */}
                <div className="p-4 pb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">Today's Queue</h2>
                        <span className="bg-[#3636e2] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {queue.length + (activeApp ? 1 : 0)}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeApp ? `Now interviewing` : queue.length > 0 ? `Next up for interview` : 'No candidates waiting'}
                    </p>
                </div>

                {/* Queue List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
                    {/* Active Interview */}
                    {activeApp && (
                        <div className="p-3 bg-white rounded-xl shadow-sm border-l-4 border-[#3636e2] ring-1 ring-slate-200">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3636e2] to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                                    {activeApp.candidate?.full_name?.charAt(0) || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {activeApp.candidate?.full_name || 'Kandidat'}
                                    </p>
                                    <p className="text-[10px] text-[#3636e2] font-semibold mt-0.5">Interviewing Now</p>
                                </div>
                                <span className="relative flex h-2 w-2 mt-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3636e2] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3636e2]"></span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Waiting Queue */}
                    {queue.map((app, index) => (
                        <div key={app.id} className="p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-medium text-sm">
                                    {app.candidate?.full_name?.charAt(0) || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-[#3636e2] transition-colors">
                                        {app.candidate?.full_name || 'Kandidat'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        Waiting {getWaitingTime(app.checked_in_at)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center h-4 w-4 rounded-full bg-green-100 text-green-600 mt-1">
                                    <Check className="w-2.5 h-2.5" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {queue.length === 0 && !activeApp && (
                        <div className="text-center py-8 text-slate-400">
                            <p className="text-xs">No candidates in queue</p>
                        </div>
                    )}
                </div>

                {/* Add Walk-in Button */}
                <div className="p-3 border-t border-slate-200">
                    <button className="w-full py-2 px-4 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-white hover:border-[#3636e2] hover:text-[#3636e2] transition-all flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5" />
                        Add Walk-in
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col h-full bg-[#f6f6f8] overflow-hidden relative">
                {activeApp ? (
                    <>
                        {/* Header */}
                        <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between flex-shrink-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[#3636e2] text-lg font-bold">
                                    {activeApp.candidate?.full_name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-slate-900">
                                            Interviewing: {activeApp.candidate?.full_name || 'Kandidat'}
                                        </h2>
                                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                                            Live
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {activeApp.job?.title || 'Position'} Candidate
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors">
                                    <FileText className="w-4 h-4" />
                                    View Resume
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors">
                                    <Clock className="w-4 h-4" />
                                    History
                                </button>
                            </div>
                        </header>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 pb-20">
                            <div className="max-w-4xl mx-auto flex flex-col gap-5">
                                {/* Timer Section */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#3636e2]"></div>
                                    <div className="flex items-center gap-5 pl-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-bold font-mono text-slate-900">{getRemainingTime()}</span>
                                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Remaining</span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">Technical Deep Dive</h3>
                                            <p className="text-xs text-slate-500">Current Phase • Planned duration: 45 min</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsPaused(!isPaused)}
                                            className="h-9 w-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                        >
                                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={addTime}
                                            className="h-9 px-3 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            + 5m
                                        </button>
                                    </div>
                                </div>

                                {/* Scoring Cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Technical Skill */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                                                <span className="text-blue-500">&lt;/&gt;</span>
                                                Technical Skill
                                            </div>
                                            <span className="text-xs font-bold text-[#3636e2]">{localScores.technical}/5</span>
                                        </div>
                                        <div className="flex gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <Star
                                                    key={num}
                                                    onClick={() => setLocalScores({ ...localScores, technical: num })}
                                                    className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform ${localScores.technical >= num ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            className="w-full text-[11px] p-2 bg-[#f6f6f8] rounded-lg border-0 focus:ring-1 focus:ring-[#3636e2] resize-none text-slate-600 placeholder-slate-400"
                                            placeholder="Note on technical ability..."
                                            rows={2}
                                            value={technicalNote}
                                            onChange={(e) => setTechnicalNote(e.target.value)}
                                        />
                                    </div>

                                    {/* Communication */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                                                <span className="text-purple-500">💬</span>
                                                Communication
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">{localScores.communication}/5</span>
                                        </div>
                                        <div className="flex gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <Star
                                                    key={num}
                                                    onClick={() => setLocalScores({ ...localScores, communication: num })}
                                                    className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform ${localScores.communication >= num ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            className="w-full text-[11px] p-2 bg-[#f6f6f8] rounded-lg border-0 focus:ring-1 focus:ring-[#3636e2] resize-none text-slate-600 placeholder-slate-400"
                                            placeholder="Note on communication..."
                                            rows={2}
                                            value={communicationNote}
                                            onChange={(e) => setCommunicationNote(e.target.value)}
                                        />
                                    </div>

                                    {/* Attitude */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                                                <span className="text-green-500">😊</span>
                                                Attitude
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">{localScores.attitude}/5</span>
                                        </div>
                                        <div className="flex gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <Star
                                                    key={num}
                                                    onClick={() => setLocalScores({ ...localScores, attitude: num })}
                                                    className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform ${localScores.attitude >= num ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            className="w-full text-[11px] p-2 bg-[#f6f6f8] rounded-lg border-0 focus:ring-1 focus:ring-[#3636e2] resize-none text-slate-600 placeholder-slate-400"
                                            placeholder="Note on attitude..."
                                            rows={2}
                                            value={attitudeNote}
                                            onChange={(e) => setAttitudeNote(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Internal Notes */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                            ✏️ Internal Notes
                                        </h3>
                                        <span className="text-[10px] text-slate-400">Auto-saved 2m ago</span>
                                    </div>
                                    <div className="p-4">
                                        <textarea
                                            className="w-full h-32 bg-transparent border-0 focus:ring-0 p-0 text-sm text-slate-700 placeholder:text-slate-400 leading-relaxed resize-none"
                                            placeholder="Type your detailed assessment notes here. These will be shared with the hiring committee. Focus on key strengths, weaknesses, and specific project examples discussed during the interview..."
                                            value={internalNotes}
                                            onChange={(e) => setInternalNotes(e.target.value)}
                                        />
                                    </div>
                                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-1">
                                        <button className="p-1.5 rounded hover:bg-slate-200 text-slate-400">
                                            <Bold className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="p-1.5 rounded hover:bg-slate-200 text-slate-400">
                                            <Italic className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="p-1.5 rounded hover:bg-slate-200 text-slate-400">
                                            <List className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <footer className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 px-5 py-3 shadow-lg z-20">
                            <div className="max-w-4xl mx-auto flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={flagForReview}
                                        onChange={(e) => setFlagForReview(e.target.checked)}
                                        className="rounded border-slate-300 text-[#3636e2] focus:ring-[#3636e2] h-3.5 w-3.5"
                                    />
                                    Flag for review
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCompleteSession}
                                        disabled={processing}
                                        className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        Pass Candidate
                                    </button>
                                    <button
                                        onClick={handleCompleteSession}
                                        disabled={processing}
                                        className="px-5 py-2 rounded-xl bg-[#3636e2] text-white font-medium text-sm hover:bg-blue-700 shadow-lg shadow-[#3636e2]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Save & End Session
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </footer>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 mx-auto mb-5 bg-[#3636e2]/10 rounded-full flex items-center justify-center">
                                <Play className="w-10 h-10 text-[#3636e2] fill-current" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Ready for Next Interview?</h2>
                            <p className="text-slate-500 text-sm mb-6">
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
                                        <Users className="w-5 h-5" />
                                        Call Next Candidate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
