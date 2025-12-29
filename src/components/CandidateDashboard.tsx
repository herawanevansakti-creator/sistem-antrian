'use client';

import { useState } from 'react';
import {
    HelpCircle,
    CheckCircle,
    Ticket,
    Bell,
    Timer,
    MapPin,
    FileText,
    Loader2,
    QrCode,
    Phone,
    Mail,
    User,
    ArrowRight,
    AlertCircle,
    Shield
} from 'lucide-react';
import type { Profile } from '@/types';

interface CandidateDashboardProps {
    profile?: Profile;
    notify: (msg: string) => void;
}

interface PesertaData {
    id: number;
    nik: string;
    sobatId: string;
    nama: string;
    nomorAntrean?: string;
    status: string;
    posisiDilamar: string;
}

export default function CandidateDashboard({ profile, notify }: CandidateDashboardProps) {
    // State untuk login NIK (peserta tanpa akun Clerk)
    const [nikLogin, setNikLogin] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [pesertaData, setPesertaData] = useState<PesertaData | null>(null);

    // State untuk check-in
    const [locationVerified, setLocationVerified] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);

    // Simulasi data peserta (sesuai dengan sample-data-peserta.sql)
    // Nanti akan diganti dengan query ke Supabase
    const mockPesertaDB: PesertaData[] = [
        // Peserta yang sudah check-in (Menunggu)
        { id: 1, nik: '3301017670101001', sobatId: '331023110301', nama: 'Pingki Setriana', nomorAntrean: 'A-001', status: 'Menunggu', posisiDilamar: 'Petugas Pencacah' },
        { id: 2, nik: '3310105510920001', sobatId: '331022020080', nama: 'Heni Purnama Sari', nomorAntrean: 'A-002', status: 'Menunggu', posisiDilamar: 'Pengawas' },
        { id: 3, nik: '3310011412950001', sobatId: '331022020069', nama: 'Daiyan Agung Santosa', nomorAntrean: 'A-003', status: 'Menunggu', posisiDilamar: 'Petugas Pencacah' },
        { id: 4, nik: '3310081604970001', sobatId: '331022020071', nama: 'Matyas Wahyu Bagaskoro', nomorAntrean: 'A-004', status: 'Menunggu', posisiDilamar: 'Pengawas' },
        { id: 5, nik: '3310112509930001', sobatId: '331022020130', nama: 'Muhammad Yasser Arafat', nomorAntrean: 'A-005', status: 'Menunggu', posisiDilamar: 'Petugas Pencacah' },
        // Peserta yang belum check-in (Terdaftar)
        { id: 6, nik: '3302055308950001', sobatId: '331022020059', nama: 'Siti Rosyidah', status: 'Terdaftar', posisiDilamar: 'Petugas Pencacah' },
        { id: 7, nik: '3310094905760001', sobatId: '331022040033', nama: 'Winarti', status: 'Terdaftar', posisiDilamar: 'Petugas Pencacah' },
        { id: 8, nik: '3310090807870001', sobatId: '331022020079', nama: 'Jarot Tri Yuliawan', status: 'Terdaftar', posisiDilamar: 'Pengawas' },
        { id: 9, nik: '3310206512770002', sobatId: '331022020038', nama: 'Sri Rahayu', status: 'Terdaftar', posisiDilamar: 'Koordinator Statistik Kecamatan' },
        { id: 10, nik: '3310110807820001', sobatId: '331022020247', nama: 'Yuliadi', status: 'Terdaftar', posisiDilamar: 'Koordinator Statistik Kecamatan' },
        // Peserta yang sudah lulus
        { id: 11, nik: '3302011506880001', sobatId: '331022020101', nama: 'Bambang Supriadi', status: 'Lulus', posisiDilamar: 'Pengawas' },
        { id: 12, nik: '3310152808910001', sobatId: '331022020156', nama: 'Dewi Lestari', status: 'Lulus', posisiDilamar: 'Petugas Pencacah' },
        { id: 13, nik: '3310180205850001', sobatId: '331022020189', nama: 'Eko Prasetyo', status: 'Lulus', posisiDilamar: 'Petugas Pencacah' },
        { id: 14, nik: '3302201512890001', sobatId: '331022020212', nama: 'Fitri Handayani', status: 'Lulus', posisiDilamar: 'Pengawas' },
        { id: 15, nik: '3310221008870001', sobatId: '331022020234', nama: 'Gunawan Wibisono', status: 'Lulus', posisiDilamar: 'Petugas Pencacah' },
        // Peserta tidak lulus
        { id: 16, nik: '3310250312920001', sobatId: '331022020267', nama: 'Hendri Kurniawan', status: 'Tidak Lulus', posisiDilamar: 'Petugas Pencacah' },
        { id: 17, nik: '3302281709900001', sobatId: '331022020289', nama: 'Indah Permata Sari', status: 'Tidak Lulus', posisiDilamar: 'Petugas Pencacah' },
        { id: 18, nik: '3310301405880001', sobatId: '331022020312', nama: 'Joko Widodo', status: 'Tidak Lulus', posisiDilamar: 'Petugas Pencacah' },
        // Peserta ditinjau
        { id: 19, nik: '3310332011850001', sobatId: '331022020345', nama: 'Kartika Dewi', status: 'Ditinjau', posisiDilamar: 'Petugas Pencacah' },
        { id: 20, nik: '3302351803870001', sobatId: '331022020378', nama: 'Lukman Hakim', status: 'Ditinjau', posisiDilamar: 'Pengawas' },
    ];

    const handleNikLogin = async () => {
        if (nikLogin.length !== 16) {
            setLoginError('NIK harus 16 digit');
            return;
        }

        setIsLoggingIn(true);
        setLoginError('');

        // Simulasi cek NIK di database (nanti pakai Supabase)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const found = mockPesertaDB.find(p => p.nik === nikLogin);

        if (found) {
            setPesertaData(found);
            notify(`Selamat datang, ${found.nama}!`);
        } else {
            setLoginError('NIK tidak ditemukan. Pastikan NIK terdaftar sebagai peserta.');
        }

        setIsLoggingIn(false);
    };

    const verifyLocation = () => {
        setLocationLoading(true);
        if (!navigator.geolocation) {
            notify("Fitur geolokasi tidak didukung browser Anda.");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocationVerified(true);
                setLocationLoading(false);
                notify("Lokasi berhasil diverifikasi!");
            },
            () => {
                notify("Gagal mendapatkan lokasi. Pastikan GPS Anda aktif.");
                setLocationLoading(false);
            }
        );
    };

    const handleCheckIn = async () => {
        if (!pesertaData) return;

        setCheckingIn(true);

        // Simulasi check-in (nanti pakai Supabase function)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newAntrean = 'A-' + String(Math.floor(Math.random() * 100) + 1).padStart(3, '0');
        setPesertaData({
            ...pesertaData,
            nomorAntrean: newAntrean,
            status: 'Menunggu'
        });

        notify(`Check-in berhasil! Nomor antrean Anda: ${newAntrean}`);
        setCheckingIn(false);
    };

    const handleLogout = () => {
        setPesertaData(null);
        setNikLogin('');
        setLocationVerified(false);
    };

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Jika peserta belum login dengan NIK, tampilkan form login NIK
    if (!pesertaData) {
        return (
            <div style={{
                backgroundColor: '#f6f6f8',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Inter', sans-serif"
            }}>
                {/* Header */}
                <header style={{
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e8e8f3',
                    padding: '16px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #3636e2, #60a5fa)',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 18,
                                fontWeight: 700
                            }}>
                                BPS
                            </div>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Sistem Antrean Wawancara</h2>
                                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Seleksi Mitra BPS 2026</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <a href="#" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                color: '#6b7280',
                                textDecoration: 'none',
                                fontSize: 14
                            }}>
                                <HelpCircle style={{ width: 18, height: 18 }} />
                                Bantuan
                            </a>
                        </div>
                    </div>
                </header>

                {/* Main Content - NIK Login */}
                <main style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 24,
                        padding: '48px',
                        width: '100%',
                        maxWidth: 480,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                        textAlign: 'center'
                    }}>
                        {/* Icon */}
                        <div style={{
                            width: 80,
                            height: 80,
                            background: 'linear-gradient(135deg, #3636e2, #60a5fa)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 8px 24px rgba(54, 54, 226, 0.3)'
                        }}>
                            <User style={{ width: 40, height: 40, color: 'white' }} />
                        </div>

                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                            Portal Peserta
                        </h1>
                        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 32px', lineHeight: 1.6 }}>
                            Masukkan NIK Anda untuk mengakses sistem antrean wawancara
                        </p>

                        {/* NIK Input */}
                        <div style={{ textAlign: 'left', marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Nomor Induk Kependudukan (NIK)
                            </label>
                            <input
                                type="text"
                                value={nikLogin}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                    setNikLogin(value);
                                    setLoginError('');
                                }}
                                placeholder="Masukkan 16 digit NIK"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    fontSize: 16,
                                    border: loginError ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                    borderRadius: 12,
                                    outline: 'none',
                                    fontFamily: 'monospace',
                                    letterSpacing: '1px',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    if (!loginError) e.currentTarget.style.borderColor = '#3636e2';
                                }}
                                onBlur={(e) => {
                                    if (!loginError) e.currentTarget.style.borderColor = '#e5e7eb';
                                }}
                            />
                            <p style={{
                                fontSize: 12,
                                color: loginError ? '#ef4444' : '#9ca3af',
                                margin: '8px 0 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            }}>
                                {loginError ? (
                                    <>
                                        <AlertCircle size={14} />
                                        {loginError}
                                    </>
                                ) : (
                                    `${nikLogin.length}/16 digit`
                                )}
                            </p>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleNikLogin}
                            disabled={nikLogin.length !== 16 || isLoggingIn}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: nikLogin.length === 16 ? 'linear-gradient(135deg, #3636e2, #5858f5)' : '#e5e7eb',
                                color: nikLogin.length === 16 ? '#ffffff' : '#9ca3af',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: nikLogin.length === 16 && !isLoggingIn ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: 'all 0.2s',
                                boxShadow: nikLogin.length === 16 ? '0 4px 14px rgba(54, 54, 226, 0.3)' : 'none'
                            }}
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                                    Memverifikasi...
                                </>
                            ) : (
                                <>
                                    Masuk
                                    <ArrowRight style={{ width: 18, height: 18 }} />
                                </>
                            )}
                        </button>

                        {/* Security Notice */}
                        <div style={{
                            marginTop: 24,
                            padding: '16px',
                            background: '#f0fdf4',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            textAlign: 'left'
                        }}>
                            <Shield style={{ width: 20, height: 20, color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', margin: '0 0 4px' }}>
                                    Keamanan Data
                                </p>
                                <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.5 }}>
                                    NIK Anda hanya digunakan untuk verifikasi kehadiran.
                                    Pastikan Anda berada di lokasi wawancara BPS.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer style={{
                    padding: '20px 24px',
                    borderTop: '1px solid #e8e8f3',
                    backgroundColor: '#ffffff',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                        © 2025 Badan Pusat Statistik. Seleksi Petugas Mitra 2026.
                    </p>
                </footer>

                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    // Peserta sudah login - tampilkan dashboard
    const isCheckedIn = pesertaData.status !== 'Terdaftar';
    const firstName = pesertaData.nama.split(' ')[0];

    return (
        <div style={{ backgroundColor: '#f6f6f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e8e8f3',
                padding: '16px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #3636e2, #60a5fa)',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 18,
                            fontWeight: 700
                        }}>
                            BPS
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Sistem Antrean Wawancara</h2>
                            <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Seleksi Mitra BPS 2026</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <button
                            onClick={() => notify('Fitur bantuan akan segera tersedia')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                height: 40,
                                padding: '0 20px',
                                backgroundColor: 'rgba(54, 54, 226, 0.1)',
                                color: '#3636e2',
                                borderRadius: 8,
                                border: 'none',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <HelpCircle style={{ width: 20, height: 20 }} />
                            Bantuan
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, borderLeft: '1px solid #e5e7eb' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{pesertaData.nama}</p>
                                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Peserta Seleksi</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    border: '2px solid #e5e7eb',
                                    background: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                                title="Keluar"
                            >
                                <User style={{ width: 20, height: 20 }} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', padding: '32px', width: '100%' }}>
                {/* Page Heading */}
                <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: 0, marginBottom: 8 }}>
                            Selamat Datang, {firstName}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: '#fff',
                                padding: '4px 12px',
                                borderRadius: 6,
                                border: '1px solid #e5e7eb',
                                fontSize: 13,
                                color: '#6b7280'
                            }}>
                                <Ticket style={{ width: 16, height: 16 }} />
                                Sobat-ID: {pesertaData.sobatId}
                            </span>
                            <span style={{ color: '#6b7280' }}>•</span>
                            <span style={{ fontWeight: 600, color: '#3636e2', fontSize: 13 }}>
                                Posisi: {pesertaData.posisiDilamar}
                            </span>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: '#fff',
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 14,
                        color: '#6b7280'
                    }}>
                        <Timer style={{ width: 16, height: 16 }} />
                        {today}
                    </div>
                </div>

                {/* Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Status Card */}
                        {isCheckedIn ? (
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 24,
                                border: '1px solid #e5e7eb',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, background: 'rgba(54, 54, 226, 0.05)', borderRadius: '50%', filter: 'blur(48px)', transform: 'translate(50%, -50%)' }} />
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle style={{ width: 36, height: 36 }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0, marginBottom: 4 }}>Anda Telah Check-in</h3>
                                        <p style={{ color: '#4b5563', margin: 0, lineHeight: 1.6, maxWidth: 500 }}>
                                            Harap menunggu di ruang tunggu dan perhatikan panggilan nomor antrean Anda.
                                        </p>
                                    </div>
                                    <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 24 }}>
                                        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', fontWeight: 600 }}>Status</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3636e2', fontWeight: 700, marginTop: 4 }}>
                                            <span style={{ position: 'relative', width: 10, height: 10 }}>
                                                <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#3636e2', opacity: 0.75, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                                                <span style={{ position: 'relative', display: 'block', width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3636e2' }} />
                                            </span>
                                            {pesertaData.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 32,
                                border: '1px solid #e5e7eb',
                                textAlign: 'center'
                            }}>
                                <QrCode style={{ width: 64, height: 64, color: '#3636e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Check-in Diperlukan</h3>
                                <p style={{ color: '#6b7280', marginBottom: 24 }}>Verifikasi lokasi Anda dan lakukan check-in untuk masuk ke antrean wawancara.</p>

                                {!locationVerified ? (
                                    <button
                                        onClick={verifyLocation}
                                        disabled={locationLoading}
                                        style={{
                                            backgroundColor: '#3636e2',
                                            color: '#fff',
                                            padding: '14px 32px',
                                            borderRadius: 12,
                                            border: 'none',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            opacity: locationLoading ? 0.5 : 1,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                    >
                                        <MapPin style={{ width: 18, height: 18 }} />
                                        {locationLoading ? 'Memverifikasi...' : 'Verifikasi Lokasi'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={checkingIn}
                                        style={{
                                            backgroundColor: '#22c55e',
                                            color: '#fff',
                                            padding: '14px 32px',
                                            borderRadius: 12,
                                            border: 'none',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            opacity: checkingIn ? 0.5 : 1,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                    >
                                        <CheckCircle style={{ width: 18, height: 18 }} />
                                        {checkingIn ? 'Memproses...' : 'Check-in Sekarang'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Stats Row */}
                        {isCheckedIn && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, color: '#6b7280' }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>Nomor Antrean Anda</span>
                                        <Ticket style={{ width: 24, height: 24, color: '#3636e2' }} />
                                    </div>
                                    <p style={{ fontSize: 48, fontWeight: 900, color: '#3636e2', margin: 0, fontFamily: 'monospace' }}>{pesertaData.nomorAntrean || '-'}</p>
                                </div>
                                <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, color: '#6b7280' }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>Sedang Dipanggil</span>
                                        <Bell style={{ width: 24, height: 24, color: '#22c55e' }} />
                                    </div>
                                    <p style={{ fontSize: 48, fontWeight: 900, color: '#111827', margin: 0, fontFamily: 'monospace' }}>A-001</p>
                                </div>
                                <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, color: '#6b7280' }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>Estimasi Tunggu</span>
                                        <Timer style={{ width: 24, height: 24, color: '#f97316' }} />
                                    </div>
                                    <p style={{ fontSize: 48, fontWeight: 900, color: '#111827', margin: 0 }}>
                                        ~15 <span style={{ fontSize: 20, fontWeight: 700, color: '#6b7280' }}>menit</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Info untuk yang belum check-in */}
                        {!isCheckedIn && (
                            <div style={{
                                backgroundColor: '#eff6ff',
                                borderRadius: 16,
                                padding: 24,
                                border: '1px solid #bfdbfe'
                            }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e40af', margin: '0 0 12px' }}>Informasi Penting</h3>
                                <ul style={{ margin: 0, paddingLeft: 20, color: '#1e40af', fontSize: 14, lineHeight: 1.8 }}>
                                    <li>Pastikan Anda berada di lokasi kantor BPS untuk melakukan check-in</li>
                                    <li>Siapkan KTP/identitas yang valid untuk verifikasi</li>
                                    <li>Wawancara akan berlangsung selama ± 30 menit</li>
                                    <li>Berpakaian rapi dan sopan</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* QR Code Widget */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                            <div style={{ padding: 20, borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontWeight: 700, color: '#111827', margin: 0 }}>Kartu Peserta</h3>
                                <span style={{ backgroundColor: isCheckedIn ? '#dcfce7' : '#fef3c7', color: isCheckedIn ? '#166534' : '#92400e', fontSize: 12, padding: '4px 10px', borderRadius: 4, fontWeight: 600 }}>
                                    {isCheckedIn ? 'Aktif' : 'Belum Check-in'}
                                </span>
                            </div>
                            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                                <div style={{
                                    width: 140,
                                    height: 140,
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <QrCode style={{ width: 70, height: 70, color: '#111827' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{pesertaData.nama}</p>
                                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0, fontFamily: 'monospace' }}>NIK: {pesertaData.nik}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontWeight: 700, color: '#111827', margin: 0, marginBottom: 16 }}>Informasi Kontak</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(54, 54, 226, 0.1)', color: '#3636e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone style={{ width: 20, height: 20 }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Hotline BPS</p>
                                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>(0341) 123-4567</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail style={{ width: 20, height: 20 }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Email</p>
                                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>rekrutmen@bps.go.id</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ marginTop: 'auto', padding: '24px 0', borderTop: '1px solid #e8e8f3', backgroundColor: '#ffffff' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#6b7280' }}>
                    <p style={{ margin: 0 }}>© 2025 Badan Pusat Statistik. Seleksi Petugas Mitra 2026.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                        Sistem Berjalan Normal
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
            `}</style>
        </div>
    );
}
