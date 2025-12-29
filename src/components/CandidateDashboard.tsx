'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import {
    HelpCircle,
    CheckCircle,
    Ticket,
    Bell,
    Timer,
    MapPin,
    FileText,
    FolderOpen,
    Download,
    ExternalLink,
    Loader2,
    QrCode,
    Phone,
    Mail
} from 'lucide-react';
import Link from 'next/link';
import { useCandidateApplication, useJobs, checkInWithLocation } from '@/lib/hooks';
import type { Profile } from '@/types';

interface CandidateDashboardProps {
    profile: Profile;
    notify: (msg: string) => void;
}

export default function CandidateDashboard({ profile, notify }: CandidateDashboardProps) {
    const { application, loading } = useCandidateApplication(profile.id);
    const { jobs } = useJobs();
    const [locationVerified, setLocationVerified] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [showJobSelection, setShowJobSelection] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const verifyLocation = () => {
        setLocationLoading(true);
        if (!navigator.geolocation) {
            notify("Fitur geolokasi tidak didukung browser Anda.");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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

    const handleCheckIn = async (jobId: number) => {
        if (!userLocation) {
            verifyLocation();
            return;
        }

        setCheckingIn(true);
        const result = await checkInWithLocation(
            profile.id,
            jobId,
            userLocation.lat,
            userLocation.lng
        );

        if (result.status === 'success') {
            notify(`Berhasil check-in! Nomor antrean Anda: ${result.queue_number}`);
            setShowJobSelection(false);
        } else {
            notify(result.message || 'Gagal melakukan check-in');
        }
        setCheckingIn(false);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 style={{ width: 32, height: 32, color: '#3636e2', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const firstName = profile.full_name?.split(' ')[0] || 'Peserta';
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Determine status
    const isCheckedIn = !!application;
    const queueNumber = application?.queue_number || '-';
    const currentServing = 'A-05'; // Mock - akan dari data realtime
    const estimatedWait = '~15';

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
                            backgroundColor: 'linear-gradient(135deg, #3636e2, #60a5fa)',
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
                        <button style={{
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
                        }}>
                            <HelpCircle style={{ width: 20, height: 20 }} />
                            Bantuan
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, borderLeft: '1px solid #e5e7eb' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{profile.full_name}</p>
                                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Peserta Seleksi</p>
                            </div>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', padding: '32px 32px', width: '100%' }}>
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
                                ID: BPS-2026-{profile.id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{ color: '#6b7280' }}>•</span>
                            <span style={{ fontWeight: 600, color: '#3636e2', fontSize: 13 }}>
                                Posisi: {application?.job?.title || 'Petugas Pencacah'}
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
                                            Terima kasih telah hadir tepat waktu. Anda sudah terdaftar dalam antrean. Harap menunggu di ruang tunggu dan perhatikan panggilan nomor antrean Anda.
                                        </p>
                                    </div>
                                    <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 24 }}>
                                        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', fontWeight: 600 }}>Status</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3636e2', fontWeight: 700, marginTop: 4 }}>
                                            <span style={{ position: 'relative', width: 10, height: 10 }}>
                                                <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#3636e2', opacity: 0.75, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                                                <span style={{ position: 'relative', display: 'block', width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3636e2' }} />
                                            </span>
                                            Dalam Antrean
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
                                ) : !showJobSelection ? (
                                    <button
                                        onClick={() => setShowJobSelection(true)}
                                        style={{
                                            backgroundColor: '#22c55e',
                                            color: '#fff',
                                            padding: '14px 32px',
                                            borderRadius: 12,
                                            border: 'none',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                    >
                                        <CheckCircle style={{ width: 18, height: 18 }} />
                                        Check-in Sekarang
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Pilih posisi yang Anda lamar:</p>
                                        {jobs.map(job => (
                                            <button
                                                key={job.id}
                                                onClick={() => handleCheckIn(job.id)}
                                                disabled={checkingIn}
                                                style={{
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#111827',
                                                    padding: '12px 24px',
                                                    borderRadius: 8,
                                                    border: '1px solid #e5e7eb',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    opacity: checkingIn ? 0.5 : 1
                                                }}
                                            >
                                                {checkingIn ? 'Memproses...' : job.title}
                                            </button>
                                        ))}
                                    </div>
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
                                    <p style={{ fontSize: 48, fontWeight: 900, color: '#3636e2', margin: 0, fontFamily: 'monospace' }}>{queueNumber}</p>
                                </div>
                                <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, color: '#6b7280' }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>Sedang Dipanggil</span>
                                        <Bell style={{ width: 24, height: 24, color: '#22c55e' }} />
                                    </div>
                                    <p style={{ fontSize: 48, fontWeight: 900, color: '#111827', margin: 0, fontFamily: 'monospace' }}>{currentServing}</p>
                                    <div style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginTop: 12 }}>
                                        <div style={{ height: '100%', backgroundColor: '#22c55e', borderRadius: 3, width: '60%' }} />
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, color: '#6b7280' }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>Estimasi Tunggu</span>
                                        <Timer style={{ width: 24, height: 24, color: '#f97316' }} />
                                    </div>
                                    <p style={{ fontSize: 48, fontWeight: 900, color: '#111827', margin: 0 }}>
                                        {estimatedWait} <span style={{ fontSize: 20, fontWeight: 700, color: '#6b7280' }}>menit</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Progress Stepper */}
                        {isCheckedIn && (
                            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontWeight: 700, color: '#111827', margin: 0 }}>Tahapan Hari Ini</h3>
                                    <span style={{ fontSize: 14, color: '#3636e2', fontWeight: 500, cursor: 'pointer' }}>Lihat Detail</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                    {/* Connecting line */}
                                    <div style={{ position: 'absolute', top: 16, left: '10%', right: '10%', height: 2, backgroundColor: '#e5e7eb', zIndex: 0 }} />

                                    {/* Steps */}
                                    {[
                                        { label: 'Pendaftaran', sub: 'Selesai', done: true },
                                        { label: 'Check-in', sub: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), done: true },
                                        { label: 'Menunggu', sub: 'Dalam Antrean', active: true },
                                        { label: 'Wawancara', sub: 'Belum dimulai', pending: true },
                                        { label: 'Selesai', sub: 'Menunggu', pending: true },
                                    ].map((step, i) => (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, opacity: step.pending ? 0.5 : 1 }}>
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: step.done ? '#22c55e' : step.active ? '#3636e2' : '#e5e7eb',
                                                color: step.done || step.active ? '#fff' : '#6b7280',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                boxShadow: '0 0 0 4px #fff'
                                            }}>
                                                {step.done ? '✓' : i + 1}
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: step.active ? '#3636e2' : '#111827', margin: 0 }}>{step.label}</p>
                                                <p style={{ fontSize: 12, color: step.active ? '#3636e2' : '#6b7280', margin: 0 }}>{step.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info Card untuk yang belum check-in */}
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
                                    width: 160,
                                    height: 160,
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <QrCode style={{ width: 80, height: 80, color: '#111827' }} />
                                </div>
                                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                                    Tunjukkan QR Code ini kepada petugas saat dipanggil untuk wawancara.
                                </p>
                            </div>
                        </div>

                        {/* Location Widget */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                            <div style={{ height: 120, backgroundColor: '#d1d5db', position: 'relative', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(135deg, #3636e2 0%, #60a5fa 100%)',
                                    opacity: 0.9
                                }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <MapPin style={{ width: 32, height: 32, marginBottom: 8 }} />
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Kantor BPS Kabupaten/Kota</span>
                                </div>
                            </div>
                            <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: locationVerified ? '#16a34a' : '#6b7280' }}>
                                    {locationVerified ? (
                                        <>
                                            <CheckCircle style={{ width: 18, height: 18 }} />
                                            Lokasi Terverifikasi
                                        </>
                                    ) : (
                                        <>
                                            <MapPin style={{ width: 18, height: 18 }} />
                                            Belum Terverifikasi
                                        </>
                                    )}
                                </div>
                                <button style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#3636e2',
                                    backgroundColor: 'rgba(54, 54, 226, 0.1)',
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: 'none',
                                    cursor: 'pointer'
                                }}>
                                    Petunjuk Arah
                                </button>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Kebijakan Privasi</a>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Syarat & Ketentuan</a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                            Sistem Berjalan Normal
                        </div>
                    </div>
                </div>
            </footer>

            {/* CSS Animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
