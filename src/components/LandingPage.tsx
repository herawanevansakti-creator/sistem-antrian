'use client';

import Link from 'next/link';
import { User, ClipboardCheck, Settings, ArrowRight, HelpCircle, Phone, Building2, Shield } from 'lucide-react';

export default function LandingPage() {
    return (
        <div style={{ backgroundColor: '#f6f6f8', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decor */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'rgba(54, 54, 226, 0.05)', filter: 'blur(120px)' }} />
                <div style={{ position: 'absolute', top: '40%', left: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.05)', filter: 'blur(100px)' }} />
            </div>

            {/* Top Navigation */}
            <header style={{ position: 'relative', zIndex: 10, width: '100%', padding: '20px 40px', borderBottom: '1px solid rgba(229, 231, 235, 0.5)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3636e2, #60a5fa)',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 700
                        }}>
                            BPS
                        </div>
                        <div>
                            <h2 style={{ color: '#0e0e1b', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>Sistem Antrean Wawancara</h2>
                            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Badan Pusat Statistik</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle style={{ width: '16px', height: '16px' }} />
                            Pusat Bantuan
                        </a>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Phone style={{ width: '16px', height: '16px' }} />
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 16px' }}>
                <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {/* Official Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '24px',
                        backgroundColor: 'rgba(54, 54, 226, 0.1)',
                        color: '#3636e2',
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '24px'
                    }}>
                        <Shield style={{ width: '16px', height: '16px' }} />
                        Sistem Resmi BPS 2026
                    </div>

                    {/* Hero Text */}
                    <div style={{ marginBottom: '48px', maxWidth: '700px' }}>
                        <h1 style={{ color: '#0e0e1b', fontSize: '44px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '24px' }}>
                            Seleksi Wawancara Calon<br />
                            <span style={{ color: '#3636e2' }}>Petugas Mitra BPS 2026</span>
                        </h1>
                        <p style={{ color: '#505095', fontSize: '17px', fontWeight: 400, lineHeight: 1.7 }}>
                            Selamat datang di portal Sistem Antrean Wawancara untuk seleksi calon petugas mitra
                            sensus dan survei tambahan BPS tahun 2026. Silakan pilih peran Anda untuk melanjutkan.
                        </p>
                    </div>

                    {/* Role Selection Cards */}
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {/* Card 1: Peserta */}
                        <Link
                            href="/peserta"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '32px',
                                borderRadius: '16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(54, 54, 226, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '50%', backgroundColor: '#eff6ff' }}>
                                <User style={{ width: '28px', height: '28px', color: '#3636e2' }} />
                            </div>
                            <h3 style={{ color: '#0e0e1b', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Peserta</h3>
                            <p style={{ color: '#505095', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', textAlign: 'left' }}>
                                Login dengan NIK untuk check-in, lihat nomor antrean, dan pantau status wawancara Anda.
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3636e2', fontWeight: 600, fontSize: '14px' }}>
                                Masuk dengan NIK
                                <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                            </div>
                        </Link>

                        {/* Card 2: Pewawancara */}
                        <Link
                            href="/sign-in"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '32px',
                                borderRadius: '16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(54, 54, 226, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '50%', backgroundColor: '#f3e8ff' }}>
                                <ClipboardCheck style={{ width: '28px', height: '28px', color: '#9333ea' }} />
                            </div>
                            <h3 style={{ color: '#0e0e1b', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Pewawancara</h3>
                            <p style={{ color: '#505095', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', textAlign: 'left' }}>
                                Kelola sesi wawancara, berikan penilaian dengan timer, dan kirim hasil evaluasi peserta.
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3636e2', fontWeight: 600, fontSize: '14px' }}>
                                Buka Panel
                                <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                            </div>
                        </Link>

                        {/* Card 3: Administrator */}
                        <Link
                            href="/sign-in"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '32px',
                                borderRadius: '16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(54, 54, 226, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '50%', backgroundColor: '#d1fae5' }}>
                                <Settings style={{ width: '28px', height: '28px', color: '#059669' }} />
                            </div>
                            <h3 style={{ color: '#0e0e1b', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Administrator</h3>
                            <p style={{ color: '#505095', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', textAlign: 'left' }}>
                                Upload data peserta, kelola antrean, lihat statistik dan rekap hasil wawancara.
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3636e2', fontWeight: 600, fontSize: '14px' }}>
                                Login Admin
                                <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                            </div>
                        </Link>
                    </div>

                    {/* Info Box */}
                    <div style={{
                        marginTop: '48px',
                        padding: '20px 32px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '12px',
                        border: '1px solid #fde68a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        maxWidth: '700px'
                    }}>
                        <Building2 style={{ width: '24px', height: '24px', color: '#f59e0b', flexShrink: 0 }} />
                        <p style={{ color: '#92400e', fontSize: '14px', margin: 0, textAlign: 'left', lineHeight: 1.6 }}>
                            <strong>Informasi:</strong> Pastikan Anda sudah terdaftar dan membawa dokumen identitas yang valid
                            saat datang ke lokasi wawancara.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 40px', textAlign: 'center', borderTop: '1px solid rgba(229, 231, 235, 0.5)', backgroundColor: '#ffffff' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#505095', fontSize: '14px', margin: 0 }}>© 2025 Badan Pusat Statistik. Seleksi Petugas Mitra 2026.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', textDecoration: 'none' }}>Kebijakan Privasi</a>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', textDecoration: 'none' }}>Syarat & Ketentuan</a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Sistem Online</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Responsive Styles */}
            <style jsx>{`
                @media (max-width: 768px) {
                    main > div > div:last-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
