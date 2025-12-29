'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Clock, Video, CheckCircle, Volume2, VolumeX, Play } from 'lucide-react';

interface Peserta {
    id: number;
    nama: string;
    nomorAntrean: string;
    posisiDilamar: string;
    status: 'Menunggu' | 'Diwawancara' | 'Selesai';
    ruangan?: string;
}

export default function DisplayPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [calledNumber, setCalledNumber] = useState<string | null>(null);
    const [calledName, setCalledName] = useState<string | null>(null);
    const [calledRoom, setCalledRoom] = useState<string | null>(null);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(80); // 0-100
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [voicesLoaded, setVoicesLoaded] = useState(false);
    const announcementQueue = useRef<{ number: string, name: string, room: string }[]>([]);
    const isAnnouncing = useRef(false);

    // Data peserta (nanti real-time dari Supabase)
    const [pesertaList, setPesertaList] = useState<Peserta[]>([
        { id: 1, nama: 'Pingki Setriana', nomorAntrean: 'A-001', posisiDilamar: 'Petugas Pencacah', status: 'Diwawancara', ruangan: 'Ruang 1' },
        { id: 2, nama: 'Heni Purnama Sari', nomorAntrean: 'A-002', posisiDilamar: 'Pengawas', status: 'Diwawancara', ruangan: 'Ruang 2' },
        { id: 3, nama: 'Daiyan Agung Santosa', nomorAntrean: 'A-003', posisiDilamar: 'Petugas Pencacah', status: 'Menunggu' },
        { id: 4, nama: 'Matyas Wahyu Bagaskoro', nomorAntrean: 'A-004', posisiDilamar: 'Pengawas', status: 'Menunggu' },
        { id: 5, nama: 'Muhammad Yasser Arafat', nomorAntrean: 'A-005', posisiDilamar: 'Petugas Pencacah', status: 'Menunggu' },
        { id: 6, nama: 'Siti Rosyidah', nomorAntrean: 'A-006', posisiDilamar: 'Petugas Pencacah', status: 'Menunggu' },
        { id: 7, nama: 'Winarti', nomorAntrean: 'A-007', posisiDilamar: 'Petugas Pencacah', status: 'Menunggu' },
        { id: 8, nama: 'Jarot Tri Yuliawan', nomorAntrean: 'A-008', posisiDilamar: 'Pengawas', status: 'Menunggu' },
    ]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis?.getVoices();
            if (voices && voices.length > 0) {
                setVoicesLoaded(true);
            }
        };

        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    // Text-to-Speech function
    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (isMuted || !window.speechSynthesis) {
            onEnd?.();
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Find Indonesian voice or use default
        const voices = window.speechSynthesis.getVoices();
        const indonesianVoice = voices.find(v =>
            v.lang.includes('id') ||
            v.lang.includes('ID') ||
            v.name.toLowerCase().includes('indonesia')
        );

        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        }

        utterance.lang = 'id-ID';
        utterance.rate = 0.9;  // Sedikit lebih lambat untuk kejelasan
        utterance.pitch = 1;
        utterance.volume = volume / 100; // Use volume state

        utterance.onend = () => {
            onEnd?.();
        };

        utterance.onerror = () => {
            onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
    }, [isMuted, volume]);

    // Announce a person with voice
    const announceCall = useCallback((number: string, name: string, room: string) => {
        setCalledNumber(number);
        setCalledName(name);
        setCalledRoom(room);
        setShowAnnouncement(true);
        isAnnouncing.current = true;

        // Format nomor untuk dibacakan
        const formattedNumber = number.replace('-', ' ').split('').join(' ');

        // Announcement text sequence (room diganti ruang wawancara)
        const announcement = `
            Perhatian. Perhatian.
            Nomor antrean ${formattedNumber}.
            Atas nama ${name}.
            Silahkan menuju ruang wawancara sekarang.
            Sekali lagi, nomor ${formattedNumber}, atas nama ${name}, silahkan menuju ruang wawancara.
        `;

        // Play bell sound first, then speak
        const bellAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAAAAADMzMzxAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        bellAudio.volume = (volume / 100) * 0.7; // Bell slightly quieter than voice
        if (!isMuted) bellAudio.play().catch(() => { });

        setTimeout(() => {
            speak(announcement, () => {
                // Wait before hiding
                setTimeout(() => {
                    setShowAnnouncement(false);
                    setCalledNumber(null);
                    setCalledName(null);
                    setCalledRoom(null);
                    isAnnouncing.current = false;

                    // Process next in queue
                    if (announcementQueue.current.length > 0) {
                        const next = announcementQueue.current.shift()!;
                        setTimeout(() => announceCall(next.number, next.name, next.room), 2000);
                    }
                }, 3000);
            });
        }, 500);
    }, [speak]);

    // Demo: Manual call button for testing
    const handleManualCall = () => {
        const waiting = pesertaList.filter(p => p.status === 'Menunggu');
        if (waiting.length > 0 && !isAnnouncing.current) {
            const next = waiting[0];
            announceCall(next.nomorAntrean, next.nama, 'ruang wawancara');
        }
    };

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Demo auto-call every 45 seconds
    useEffect(() => {
        const callTimer = setInterval(() => {
            const waiting = pesertaList.filter(p => p.status === 'Menunggu');
            if (waiting.length > 0 && !isAnnouncing.current) {
                const next = waiting[0];
                announceCall(next.nomorAntrean, next.nama, 'ruang wawancara');
            }
        }, 45000);

        return () => clearInterval(callTimer);
    }, [pesertaList, announceCall]);

    const sedangWawancara = pesertaList.filter(p => p.status === 'Diwawancara');
    const menunggu = pesertaList.filter(p => p.status === 'Menunggu');
    const selesai = pesertaList.filter(p => p.status === 'Selesai');

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Sound Control Panel */}
            <div
                style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 8
                }}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
            >
                {/* Mute Button */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        border: 'none',
                        background: isMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                        color: isMuted ? '#ef4444' : '#22c55e',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={isMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>

                {/* Volume Slider Panel */}
                {showVolumeSlider && (
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 16,
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        minWidth: 200,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>Volume</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>{volume}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                height: 8,
                                borderRadius: 4,
                                appearance: 'none',
                                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, #374151 ${volume}%, #374151 100%)`,
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                            <span>🔇 Pelan</span>
                            <span>Keras 🔊</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Call Button (for demo) */}
            <button
                onClick={handleManualCall}
                disabled={isAnnouncing.current}
                style={{
                    position: 'fixed',
                    top: 80,
                    right: 20,
                    zIndex: 199,
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Panggil Manual (Demo)"
            >
                <Play size={24} />
            </button>

            {/* Announcement Overlay */}
            {showAnnouncement && calledNumber && calledName && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{
                        textAlign: 'center',
                        animation: 'pulse 1s ease infinite'
                    }}>
                        {/* Sound Wave Animation */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            marginBottom: 40
                        }}>
                            <Volume2 size={80} color="#fbbf24" style={{ animation: 'bounce 0.5s ease infinite' }} />
                            <span style={{ fontSize: 56, fontWeight: 800, color: '#fbbf24' }}>PANGGILAN</span>
                            <Volume2 size={80} color="#fbbf24" style={{ animation: 'bounce 0.5s ease infinite', animationDelay: '0.2s' }} />
                        </div>

                        {/* Queue Number */}
                        <div style={{
                            fontSize: 220,
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            color: '#22c55e',
                            textShadow: '0 0 60px rgba(34, 197, 94, 0.6)',
                            lineHeight: 1,
                            marginBottom: 24
                        }}>
                            {calledNumber}
                        </div>

                        {/* Name */}
                        <div style={{
                            fontSize: 64,
                            fontWeight: 700,
                            color: '#ffffff',
                            marginBottom: 24,
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}>
                            {calledName}
                        </div>

                        {/* Room */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            background: 'rgba(139, 92, 246, 0.3)',
                            border: '2px solid #8b5cf6',
                            padding: '16px 40px',
                            borderRadius: 20,
                            marginBottom: 32
                        }}>
                            <Video size={32} color="#a78bfa" />
                            <span style={{ fontSize: 36, fontWeight: 700, color: '#a78bfa' }}>Ruang Wawancara</span>
                        </div>

                        <p style={{ fontSize: 28, color: '#94a3b8', marginTop: 16 }}>
                            Silahkan menuju ruang wawancara sekarang
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header style={{
                background: 'rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #3636e2, #60a5fa)',
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        fontWeight: 800
                    }}>
                        BPS
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Sistem Antrean Wawancara</h1>
                        <p style={{ fontSize: 18, color: '#94a3b8', margin: '4px 0 0' }}>Seleksi Calon Petugas Mitra BPS 2026</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'monospace', color: '#22c55e' }}>
                        {formatTime(currentTime)}
                    </div>
                    <div style={{ fontSize: 18, color: '#94a3b8' }}>{formatDate(currentTime)}</div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, height: 'calc(100vh - 140px)' }}>
                {/* Left: Queue Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        <div style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: 16,
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <Video size={40} color="#a78bfa" style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 48, fontWeight: 800, color: '#a78bfa' }}>{sedangWawancara.length}</div>
                            <div style={{ fontSize: 16, color: '#94a3b8' }}>Sedang Wawancara</div>
                        </div>
                        <div style={{
                            background: 'rgba(251, 191, 36, 0.2)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: 16,
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <Clock size={40} color="#fbbf24" style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 48, fontWeight: 800, color: '#fbbf24' }}>{menunggu.length}</div>
                            <div style={{ fontSize: 16, color: '#94a3b8' }}>Dalam Antrean</div>
                        </div>
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 16,
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <CheckCircle size={40} color="#22c55e" style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 48, fontWeight: 800, color: '#22c55e' }}>{selesai.length}</div>
                            <div style={{ fontSize: 16, color: '#94a3b8' }}>Selesai Hari Ini</div>
                        </div>
                    </div>

                    {/* Currently Interviewing */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 20,
                        padding: 24,
                        flex: 1
                    }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Video size={28} color="#a78bfa" />
                            Sedang Diwawancara
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            {sedangWawancara.map(peserta => (
                                <div key={peserta.id} style={{
                                    background: 'rgba(139, 92, 246, 0.15)',
                                    border: '2px solid rgba(139, 92, 246, 0.4)',
                                    borderRadius: 16,
                                    padding: 20,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        background: '#8b5cf6',
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}>
                                        {peserta.ruangan}
                                    </div>
                                    <div style={{
                                        fontSize: 48,
                                        fontWeight: 900,
                                        fontFamily: 'monospace',
                                        color: '#a78bfa',
                                        marginBottom: 8
                                    }}>
                                        {peserta.nomorAntrean}
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{peserta.nama}</div>
                                    <div style={{ fontSize: 14, color: '#94a3b8' }}>{peserta.posisiDilamar}</div>
                                </div>
                            ))}
                            {sedangWawancara.length === 0 && (
                                <div style={{
                                    gridColumn: 'span 2',
                                    textAlign: 'center',
                                    padding: 40,
                                    color: '#64748b'
                                }}>
                                    <Video size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                                    <p style={{ fontSize: 18 }}>Tidak ada wawancara aktif</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Waiting Queue */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 20,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Users size={28} color="#fbbf24" />
                        Antrean Menunggu
                    </h2>

                    {/* Next in Queue - Highlighted */}
                    {menunggu.length > 0 && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.1))',
                            border: '2px solid #22c55e',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            animation: 'glow 2s ease infinite'
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                ⚡ Selanjutnya Dipanggil
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    fontSize: 36,
                                    fontWeight: 900,
                                    fontFamily: 'monospace',
                                    color: '#22c55e'
                                }}>
                                    {menunggu[0].nomorAntrean}
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>{menunggu[0].nama}</div>
                                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{menunggu[0].posisiDilamar}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Queue List */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {menunggu.slice(1).map((peserta, index) => (
                            <div key={peserta.id} style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 12,
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: 'rgba(251, 191, 36, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: '#fbbf24'
                                }}>
                                    #{index + 2}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{peserta.nama}</span>
                                        <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24' }}>
                                            {peserta.nomorAntrean}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{peserta.posisiDilamar}</div>
                                </div>
                            </div>
                        ))}
                        {menunggu.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: 40,
                                color: '#64748b'
                            }}>
                                <Clock size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                                <p style={{ fontSize: 16 }}>Tidak ada peserta dalam antrean</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Ticker */}
            <footer style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(90deg, #3636e2, #8b5cf6, #3636e2)',
                padding: '12px 0',
                overflow: 'hidden'
            }}>
                <div style={{
                    display: 'flex',
                    animation: 'ticker 20s linear infinite',
                    whiteSpace: 'nowrap'
                }}>
                    {[1, 2, 3].map(i => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 40, paddingRight: 100 }}>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>📢 Harap menunggu di ruang tunggu dan perhatikan nomor antrean Anda</span>
                            <span style={{ fontSize: 16 }}>•</span>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>📱 Pastikan ponsel Anda dalam mode silent</span>
                            <span style={{ fontSize: 16 }}>•</span>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>📋 Siapkan dokumen identitas (KTP)</span>
                            <span style={{ fontSize: 16 }}>•</span>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>⏱️ Durasi wawancara ±30 menit</span>
                            <span style={{ fontSize: 16 }}>•</span>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>🔊 Sistem dilengkapi pengumuman suara otomatis</span>
                            <span style={{ fontSize: 16 }}>•</span>
                        </span>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.5); }
                }
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
            `}</style>
        </div>
    );
}
