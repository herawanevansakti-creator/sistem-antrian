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
    CheckCircle2,
    Star,
    Bold,
    Italic,
    List,
    Code,
    Mic,
    Smile,
    Edit3,
    Check,
    UserPlus
} from 'lucide-react';
import {
    useQueue,
    useActiveSession,
    requestNextCandidate,
    completeInterviewSession
} from '@/lib/hooks';
import type { Profile } from '@/types';

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
        const totalSeconds = 30 * 60; // 30 menit untuk wawancara BPS
        const remaining = Math.max(0, totalSeconds - interviewTime);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for SVG ring (0-251.2)
    const getProgressOffset = (): number => {
        const totalSeconds = 30 * 60;
        const progress = Math.min(interviewTime / totalSeconds, 1);
        return 251.2 * (1 - progress);
    };

    const handleNextCandidate = async () => {
        setProcessing(true);
        const result = await requestNextCandidate(profile.id);

        if (result.status === 'success') {
            notify("Peserta berhasil dipanggil!");
            setInterviewTime(0);
        } else {
            notify(result.message || "Tidak ada peserta dalam antrean.");
        }
        setProcessing(false);
    };

    const handleCompleteSession = async () => {
        if (!activeApp) return;

        setProcessing(true);
        const combinedNotes = `${internalNotes}\n\n---\nKemampuan Teknis: ${technicalNote}\nKomunikasi: ${communicationNote}\nSikap: ${attitudeNote}${flagForReview ? '\n\n⚠️ PERLU DITINJAU ULANG' : ''}`;

        const result = await completeInterviewSession(
            activeApp.id,
            profile.id,
            interviewTime,
            { ...scores, notes: combinedNotes }
        );

        if (result.status === 'success') {
            notify("Wawancara selesai! Data berhasil disimpan.");
        } else {
            notify(result.message || "Gagal menyimpan hasil wawancara.");
        }
        setProcessing(false);
    };

    const getWaitingTime = (checkedInAt: string | null): string => {
        if (!checkedInAt) return '';
        const checkedIn = new Date(checkedInAt);
        const now = new Date();
        const diffMs = now.getTime() - checkedIn.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Baru saja';
        return `${diffMins} menit`;
    };

    // Star Rating Component
    const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((num) => (
                <button
                    key={num}
                    onClick={() => onChange(num)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.15s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <Star
                        size={20}
                        fill={value >= num ? '#3636e2' : 'none'}
                        color={value >= num ? '#3636e2' : '#cbd5e1'}
                    />
                </button>
            ))}
        </div>
    );

    if (sessionLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#f6f6f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #3636e2',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }}></div>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Memuat data...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            background: '#f6f6f8',
            color: '#0f172a',
            fontFamily: 'Inter, sans-serif',
            height: '100vh',
            display: 'flex',
            overflow: 'hidden'
        }}>
            {/* Sidebar Navigation */}
            <aside style={{
                width: '280px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff',
                borderRight: '1px solid #e2e8f0',
                zIndex: 20
            }}>
                {/* Logo */}
                <div style={{
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3636e2, #60a5fa)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(54, 54, 226, 0.3)'
                    }}>
                        BPS
                    </div>
                    <div>
                        <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Sistem Wawancara</h1>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>Portal Pewawancara</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(54, 54, 226, 0.1)',
                        color: '#3636e2',
                        textDecoration: 'none'
                    }}>
                        <LayoutDashboard size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Dasbor</span>
                    </a>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#475569',
                        textDecoration: 'none'
                    }}>
                        <Users size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Daftar Peserta</span>
                    </a>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#475569',
                        textDecoration: 'none'
                    }}>
                        <BarChart3 size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Statistik</span>
                    </a>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#475569',
                        textDecoration: 'none'
                    }}>
                        <Settings size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Pengaturan</span>
                    </a>
                </nav>

                {/* User Profile */}
                <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px' }}>
                        <UserButton afterSignOutUrl="/" />
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>{profile.full_name || 'Pewawancara'}</p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Tim Pewawancara BPS</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Layout Container for Queue and Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Queue Sidebar (Middle Column) */}
                <div style={{
                    width: '320px',
                    flexShrink: 0,
                    background: '#f6f6f8',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '20px 20px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Antrean Hari Ini</h2>
                            <span style={{
                                background: 'rgba(54, 54, 226, 0.1)',
                                color: '#3636e2',
                                fontSize: '12px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700
                            }}>
                                {queue.length + (activeApp ? 1 : 0)}
                            </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {activeApp ? 'Sedang diwawancara' : queue.length > 0 ? 'Peserta berikutnya' : 'Belum ada peserta'}
                        </p>
                    </div>

                    {/* Queue List */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Active Interview */}
                        {activeApp && (
                            <div style={{
                                padding: '12px',
                                background: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                borderLeft: '4px solid #3636e2'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3636e2, #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '14px'
                                    }}>
                                        {activeApp.candidate?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {activeApp.candidate?.full_name || 'Peserta'}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#3636e2', fontWeight: 500, marginTop: '2px' }}>Sedang Diwawancara</p>
                                    </div>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: '#3636e2',
                                        animation: 'pulse 2s infinite'
                                    }}></div>
                                </div>
                            </div>
                        )}

                        {/* Waiting Queue */}
                        {queue.map((app) => (
                            <div key={app.id} style={{
                                padding: '12px',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#475569',
                                        fontWeight: 500,
                                        fontSize: '14px'
                                    }}>
                                        {app.candidate?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: '#475569' }}>
                                            {app.candidate?.full_name || 'Peserta'}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                            Menunggu {getWaitingTime(app.checked_in_at)}
                                        </p>
                                    </div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: '#dcfce7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Check size={12} color="#16a34a" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {queue.length === 0 && !activeApp && (
                            <p style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '12px' }}>
                                Belum ada peserta dalam antrean
                            </p>
                        )}
                    </div>

                    {/* Add Walk-in */}
                    <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <button style={{
                            width: '100%',
                            padding: '8px 16px',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: '#475569',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <Plus size={16} />
                            Tambah Peserta Langsung
                        </button>
                    </div>
                </div>

                {/* Main Workspace */}
                <main style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    background: '#f6f6f8',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {activeApp ? (
                        <>
                            {/* Header */}
                            <header style={{
                                background: '#ffffff',
                                borderBottom: '1px solid #e2e8f0',
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexShrink: 0
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#3636e2',
                                        fontSize: '20px',
                                        fontWeight: 700
                                    }}>
                                        {activeApp.candidate?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                                                Mewawancarai: {activeApp.candidate?.full_name || 'Peserta'}
                                            </h2>
                                            <span style={{
                                                padding: '2px 10px',
                                                borderRadius: '20px',
                                                background: '#dcfce7',
                                                color: '#166534',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                Aktif
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                                            Posisi: {activeApp.job?.title || 'Petugas Mitra BPS'} • Antrean: {activeApp.queue_number || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        color: '#475569',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}>
                                        <FileText size={18} />
                                        Lihat Dokumen
                                    </button>
                                    <button style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        color: '#475569',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}>
                                        <Clock size={18} />
                                        Riwayat
                                    </button>
                                </div>
                            </header>

                            {/* Scrollable Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: '100px' }}>
                                <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Timer Section */}
                                    <div style={{
                                        background: '#ffffff',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '4px',
                                            height: '100%',
                                            background: '#3636e2'
                                        }}></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingLeft: '16px' }}>
                                            {/* Timer Ring */}
                                            <div style={{ position: 'relative', width: '96px', height: '96px' }}>
                                                <svg style={{ width: '96px', height: '96px', transform: 'rotate(-90deg)' }}>
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="40"
                                                        fill="transparent"
                                                        stroke="#f1f5f9"
                                                        strokeWidth="6"
                                                    />
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="40"
                                                        fill="transparent"
                                                        stroke="#3636e2"
                                                        strokeWidth="6"
                                                        strokeDasharray="251.2"
                                                        strokeDashoffset={getProgressOffset()}
                                                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                                                    />
                                                </svg>
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                                                        {getRemainingTime()}
                                                    </span>
                                                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Tersisa
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Sesi Wawancara</h3>
                                                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Durasi standar: 30 menit</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => setIsPaused(!isPaused)}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: '#f1f5f9',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: '#475569'
                                                }}
                                            >
                                                {isPaused ? <Play size={20} /> : <Pause size={20} />}
                                            </button>
                                            <button
                                                onClick={() => notify("Waktu ditambah 5 menit")}
                                                style={{
                                                    height: '40px',
                                                    padding: '0 16px',
                                                    borderRadius: '20px',
                                                    background: '#f1f5f9',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    color: '#475569'
                                                }}
                                            >
                                                + 5 menit
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scoring Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                        {/* Technical */}
                                        <div style={{
                                            background: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                    <Code size={18} color="#3b82f6" />
                                                    Kemampuan Teknis
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: scores.technical > 0 ? '#3636e2' : '#94a3b8' }}>
                                                    {scores.technical}/5
                                                </span>
                                            </div>
                                            <StarRating value={scores.technical} onChange={(v) => setScores({ ...scores, technical: v })} />
                                            <textarea
                                                style={{
                                                    width: '100%',
                                                    marginTop: '12px',
                                                    padding: '8px',
                                                    background: '#f6f6f8',
                                                    border: '1px solid transparent',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    resize: 'none',
                                                    outline: 'none',
                                                    color: '#475569'
                                                }}
                                                placeholder="Catatan kemampuan teknis..."
                                                rows={2}
                                                value={technicalNote}
                                                onChange={(e) => setTechnicalNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Communication */}
                                        <div style={{
                                            background: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                    <Mic size={18} color="#a855f7" />
                                                    Komunikasi
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: scores.communication > 0 ? '#3636e2' : '#94a3b8' }}>
                                                    {scores.communication}/5
                                                </span>
                                            </div>
                                            <StarRating value={scores.communication} onChange={(v) => setScores({ ...scores, communication: v })} />
                                            <textarea
                                                style={{
                                                    width: '100%',
                                                    marginTop: '12px',
                                                    padding: '8px',
                                                    background: '#f6f6f8',
                                                    border: '1px solid transparent',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    resize: 'none',
                                                    outline: 'none',
                                                    color: '#475569'
                                                }}
                                                placeholder="Catatan cara berkomunikasi..."
                                                rows={2}
                                                value={communicationNote}
                                                onChange={(e) => setCommunicationNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Attitude */}
                                        <div style={{
                                            background: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                    <Smile size={18} color="#22c55e" />
                                                    Sikap & Perilaku
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: scores.attitude > 0 ? '#3636e2' : '#94a3b8' }}>
                                                    {scores.attitude}/5
                                                </span>
                                            </div>
                                            <StarRating value={scores.attitude} onChange={(v) => setScores({ ...scores, attitude: v })} />
                                            <textarea
                                                style={{
                                                    width: '100%',
                                                    marginTop: '12px',
                                                    padding: '8px',
                                                    background: '#f6f6f8',
                                                    border: '1px solid transparent',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    resize: 'none',
                                                    outline: 'none',
                                                    color: '#475569'
                                                }}
                                                placeholder="Catatan sikap dan perilaku..."
                                                rows={2}
                                                value={attitudeNote}
                                                onChange={(e) => setAttitudeNote(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Internal Notes */}
                                    <div style={{
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            padding: '12px 20px',
                                            borderBottom: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                                                <Edit3 size={16} color="#94a3b8" />
                                                Catatan Internal Pewawancara
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Otomatis tersimpan</span>
                                        </div>
                                        <div style={{ padding: '16px' }}>
                                            <textarea
                                                style={{
                                                    width: '100%',
                                                    height: '160px',
                                                    border: 'none',
                                                    outline: 'none',
                                                    resize: 'none',
                                                    fontSize: '14px',
                                                    lineHeight: 1.6,
                                                    color: '#475569'
                                                }}
                                                placeholder="Tuliskan catatan penilaian lengkap di sini. Catatan ini akan tersimpan dalam rekap hasil wawancara. Fokus pada kelebihan, kekurangan, dan potensi peserta..."
                                                value={internalNotes}
                                                onChange={(e) => setInternalNotes(e.target.value)}
                                            />
                                        </div>
                                        <div style={{
                                            padding: '8px 16px',
                                            borderTop: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            display: 'flex',
                                            gap: '8px'
                                        }}>
                                            <button style={{ padding: '6px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                                                <Bold size={14} />
                                            </button>
                                            <button style={{ padding: '6px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                                                <Italic size={14} />
                                            </button>
                                            <button style={{ padding: '6px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                                                <List size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <footer style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: '#ffffff',
                                borderTop: '1px solid #e2e8f0',
                                padding: '16px',
                                boxShadow: '0 -4px 6px rgba(0,0,0,0.05)',
                                zIndex: 20
                            }}>
                                <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={flagForReview}
                                            onChange={(e) => setFlagForReview(e.target.checked)}
                                            style={{ width: '16px', height: '16px', accentColor: '#3636e2' }}
                                        />
                                        Tandai untuk ditinjau ulang
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={handleCompleteSession}
                                            disabled={processing}
                                            style={{
                                                padding: '10px 24px',
                                                borderRadius: '12px',
                                                border: '1px solid #ef4444',
                                                background: '#ffffff',
                                                color: '#ef4444',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                cursor: processing ? 'not-allowed' : 'pointer',
                                                opacity: processing ? 0.5 : 1
                                            }}
                                        >
                                            Tidak Lulus
                                        </button>
                                        <button
                                            onClick={handleCompleteSession}
                                            disabled={processing}
                                            style={{
                                                padding: '10px 24px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: '#22c55e',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                cursor: processing ? 'not-allowed' : 'pointer',
                                                opacity: processing ? 0.5 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
                                            }}
                                        >
                                            {processing ? (
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid white',
                                                    borderTopColor: 'transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }}></div>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={18} />
                                                    Lulus & Selesai
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </footer>
                        </>
                    ) : (
                        /* Empty State */
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px'
                        }}>
                            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                                <div style={{
                                    width: '96px',
                                    height: '96px',
                                    margin: '0 auto 24px',
                                    background: 'rgba(54, 54, 226, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Play size={48} color="#3636e2" fill="#3636e2" />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Siap Memulai Wawancara?</h2>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
                                    {queue.length > 0
                                        ? `Terdapat ${queue.length} peserta dalam antrean.`
                                        : 'Belum ada peserta dalam antrean. Peserta akan muncul setelah check-in.'
                                    }
                                </p>
                                <button
                                    onClick={handleNextCandidate}
                                    disabled={processing || queue.length === 0}
                                    style={{
                                        padding: '12px 32px',
                                        background: '#3636e2',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: processing || queue.length === 0 ? 'not-allowed' : 'pointer',
                                        opacity: processing || queue.length === 0 ? 0.5 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 8px 24px rgba(54, 54, 226, 0.3)'
                                    }}
                                >
                                    {processing ? (
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid white',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                    ) : (
                                        <>
                                            <UserPlus size={20} />
                                            Panggil Peserta Berikutnya
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
}
