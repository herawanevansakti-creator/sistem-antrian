'use client';

import React, { useState, useRef } from 'react';
import { UserButton } from '@clerk/nextjs';
import {
    LayoutGrid,
    Video,
    Users,
    Settings,
    QrCode,
    Search,
    Bell,
    BarChart2,
    Timer,
    UserPlus,
    Filter,
    Download,
    Eye,
    ChevronDown,
    Upload,
    FileSpreadsheet,
    X,
    CheckCircle,
    AlertCircle,
    Trash2
} from 'lucide-react';
import type { Profile } from '@/types';

interface AdminDashboardProps {
    profile: Profile;
}

interface Peserta {
    id: number;
    nama: string;
    nik: string;
    alamat: string;
    noHp: string;
    pendidikan: string;
    posisi: string;
    tanggalWawancara?: string;
    waktuWawancara?: string;
    status: 'Menunggu' | 'Diwawancara' | 'Lulus' | 'Tidak Lulus' | 'Ditinjau';
    nilaiTotal?: number;
}

export default function AdminDashboard({ profile }: AdminDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [tableSearch, setTableSearch] = useState('');
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data peserta (nanti akan diambil dari Supabase)
    const [pesertaList, setPesertaList] = useState<Peserta[]>([
        {
            id: 1,
            nama: 'Ahmad Fauzi',
            nik: '3573011234567890',
            alamat: 'Jl. Merdeka No. 45, Malang',
            noHp: '081234567890',
            pendidikan: 'S1 Statistik',
            posisi: 'Petugas Pencacah',
            tanggalWawancara: '29 Des 2025',
            waktuWawancara: '09:00',
            status: 'Menunggu',
            nilaiTotal: 0
        },
        {
            id: 2,
            nama: 'Siti Rahayu',
            nik: '3573012345678901',
            alamat: 'Jl. Diponegoro No. 12, Malang',
            noHp: '082345678901',
            pendidikan: 'D3 Akuntansi',
            posisi: 'Pengawas',
            tanggalWawancara: '29 Des 2025',
            waktuWawancara: '09:30',
            status: 'Lulus',
            nilaiTotal: 85
        },
        {
            id: 3,
            nama: 'Budi Santoso',
            nik: '3573013456789012',
            alamat: 'Jl. Sudirman No. 78, Malang',
            noHp: '083456789012',
            pendidikan: 'SMA',
            posisi: 'Petugas Pencacah',
            tanggalWawancara: '29 Des 2025',
            waktuWawancara: '10:00',
            status: 'Ditinjau',
            nilaiTotal: 72
        }
    ]);

    // Stats berdasarkan data peserta
    const stats = {
        totalPeserta: pesertaList.length,
        sudahWawancara: pesertaList.filter(p => p.status === 'Lulus' || p.status === 'Tidak Lulus').length,
        lulus: pesertaList.filter(p => p.status === 'Lulus').length,
        menunggu: pesertaList.filter(p => p.status === 'Menunggu').length
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Lulus':
                return { background: '#dcfce7', color: '#166534' };
            case 'Ditinjau':
                return { background: '#dbeafe', color: '#1e40af' };
            case 'Tidak Lulus':
                return { background: '#fee2e2', color: '#991b1b' };
            case 'Diwawancara':
                return { background: '#fef3c7', color: '#92400e' };
            case 'Menunggu':
            default:
                return { background: '#f1f5f9', color: '#475569' };
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#3636e2';
        if (score > 0) return '#f97316';
        return '#94a3b8';
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validasi tipe file
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
            setUploadStatus('error');
            setUploadMessage('Format file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV.');
            return;
        }

        setUploadStatus('uploading');
        setUploadMessage('Mengupload dan memproses data...');

        // Simulasi upload (nanti diganti dengan actual API call)
        setTimeout(() => {
            setUploadStatus('success');
            setUploadMessage(`Berhasil mengupload ${file.name}. Data peserta akan segera diproses.`);

            // Reset setelah 3 detik
            setTimeout(() => {
                setShowUploadModal(false);
                setUploadStatus('idle');
                setUploadMessage('');
            }, 2000);
        }, 2000);
    };

    const handleExport = () => {
        // Export data peserta ke CSV
        const headers = ['No', 'Nama', 'NIK', 'Alamat', 'No HP', 'Pendidikan', 'Posisi', 'Status', 'Nilai'];
        const rows = pesertaList.map((p, i) => [
            i + 1,
            p.nama,
            p.nik,
            p.alamat,
            p.noHp,
            p.pendidikan,
            p.posisi,
            p.status,
            p.nilaiTotal || '-'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data_peserta_wawancara_bps_2026.csv';
        a.click();
    };

    const filteredPeserta = pesertaList.filter(p =>
        p.nama.toLowerCase().includes(tableSearch.toLowerCase()) ||
        p.nik.includes(tableSearch) ||
        p.posisi.toLowerCase().includes(tableSearch.toLowerCase())
    );

    return (
        <div style={{
            background: '#f6f6f8',
            color: '#0f172a',
            fontFamily: 'Inter, sans-serif',
            height: '100vh',
            display: 'flex',
            overflow: 'hidden'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff',
                borderRight: '1px solid #e2e8f0'
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
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'white'
                    }}>
                        BPS
                    </div>
                    <div>
                        <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Sistem Antrean</h1>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>Wawancara Mitra BPS 2026</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                        onClick={() => setActiveMenu('dashboard')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: activeMenu === 'dashboard' ? 'rgba(54, 54, 226, 0.1)' : 'transparent',
                            color: activeMenu === 'dashboard' ? '#3636e2' : '#475569',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <LayoutGrid size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Dasbor</span>
                    </button>
                    <button
                        onClick={() => setActiveMenu('interviews')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: activeMenu === 'interviews' ? 'rgba(54, 54, 226, 0.1)' : 'transparent',
                            color: activeMenu === 'interviews' ? '#3636e2' : '#475569',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <Video size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Wawancara Aktif</span>
                    </button>
                    <button
                        onClick={() => setActiveMenu('peserta')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: activeMenu === 'peserta' ? 'rgba(54, 54, 226, 0.1)' : 'transparent',
                            color: activeMenu === 'peserta' ? '#3636e2' : '#475569',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <Users size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Daftar Peserta</span>
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'transparent',
                            color: '#475569',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <Upload size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Upload Data Peserta</span>
                    </button>
                    <button
                        onClick={() => setActiveMenu('qrcode')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: activeMenu === 'qrcode' ? 'rgba(54, 54, 226, 0.1)' : 'transparent',
                            color: activeMenu === 'qrcode' ? '#3636e2' : '#475569',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <QrCode size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Generator QR Code</span>
                    </button>
                    <button
                        onClick={() => setActiveMenu('settings')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: activeMenu === 'settings' ? 'rgba(54, 54, 226, 0.1)' : 'transparent',
                            color: activeMenu === 'settings' ? '#3636e2' : '#475569',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <Settings size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Pengaturan</span>
                    </button>
                </nav>

                {/* User Profile */}
                <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}>
                        <UserButton afterSignOutUrl="/" />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {profile.full_name || 'Administrator'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                                Admin BPS
                            </p>
                        </div>
                        <ChevronDown size={16} color="#94a3b8" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                {/* Top Header */}
                <header style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    background: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    flexShrink: 0
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                            {activeMenu === 'dashboard' && 'Dasbor'}
                            {activeMenu === 'interviews' && 'Wawancara Aktif'}
                            {activeMenu === 'peserta' && 'Daftar Peserta'}
                            {activeMenu === 'qrcode' && 'Generator QR Code'}
                            {activeMenu === 'settings' && 'Pengaturan'}
                        </h2>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                            Seleksi Wawancara Calon Petugas Mitra Sensus/Survei Tambahan BPS 2026
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Cari peserta..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    paddingLeft: '40px',
                                    paddingRight: '16px',
                                    paddingTop: '8px',
                                    paddingBottom: '8px',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    width: '240px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        {/* Notification */}
                        <button style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative'
                        }}>
                            <Bell size={18} color="#475569" />
                            <span style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                border: '2px solid #f1f5f9'
                            }}></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Stats Row */}
                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                            {/* Stat Card 1 */}
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        padding: '8px',
                                        background: '#eff6ff',
                                        borderRadius: '8px',
                                        color: '#3636e2'
                                    }}>
                                        <Users size={20} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Total Peserta</p>
                                <h3 style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{stats.totalPeserta}</h3>
                            </div>

                            {/* Stat Card 2 */}
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        padding: '8px',
                                        background: '#fef3c7',
                                        borderRadius: '8px',
                                        color: '#f59e0b'
                                    }}>
                                        <Timer size={20} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Menunggu</p>
                                <h3 style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{stats.menunggu}</h3>
                            </div>

                            {/* Stat Card 3 */}
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        padding: '8px',
                                        background: '#dcfce7',
                                        borderRadius: '8px',
                                        color: '#22c55e'
                                    }}>
                                        <CheckCircle size={20} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Lulus</p>
                                <h3 style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{stats.lulus}</h3>
                            </div>

                            {/* Stat Card 4 */}
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        padding: '8px',
                                        background: '#e0e7ff',
                                        borderRadius: '8px',
                                        color: '#6366f1'
                                    }}>
                                        <Video size={20} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Sudah Wawancara</p>
                                <h3 style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{stats.sudahWawancara}</h3>
                            </div>
                        </section>

                        {/* Participant History Table */}
                        <section style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            border: '1px solid #f1f5f9',
                            overflow: 'hidden'
                        }}>
                            {/* Table Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '16px'
                            }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Daftar Peserta Wawancara</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Search */}
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Cari nama/NIK..."
                                            value={tableSearch}
                                            onChange={(e) => setTableSearch(e.target.value)}
                                            style={{
                                                paddingLeft: '36px',
                                                paddingRight: '16px',
                                                paddingTop: '8px',
                                                paddingBottom: '8px',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                width: '200px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    {/* Upload Button */}
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            background: '#22c55e',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            color: '#ffffff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Upload size={16} />
                                        Upload
                                    </button>
                                    {/* Export Button */}
                                    <button
                                        onClick={handleExport}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            background: '#3636e2',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            color: '#ffffff',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(54, 54, 226, 0.25)'
                                        }}
                                    >
                                        <Download size={16} />
                                        Ekspor
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>No</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Peserta</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>NIK</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Posisi</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Jadwal</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Nilai</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Status</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPeserta.map((peserta, index) => (
                                            <tr key={peserta.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{index + 1}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            background: '#e0e7ff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#4f46e5',
                                                            fontSize: '14px',
                                                            fontWeight: 700
                                                        }}>
                                                            {peserta.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>{peserta.nama}</p>
                                                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{peserta.noHp}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontFamily: 'monospace' }}>{peserta.nik}</td>
                                                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{peserta.posisi}</td>
                                                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                                                    {peserta.tanggalWawancara && peserta.waktuWawancara
                                                        ? `${peserta.tanggalWawancara} ${peserta.waktuWawancara}`
                                                        : '-'
                                                    }
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 700, color: getScoreColor(peserta.nilaiTotal || 0) }}>
                                                            {peserta.nilaiTotal || '-'}
                                                        </span>
                                                        {peserta.nilaiTotal && peserta.nilaiTotal > 0 && (
                                                            <div style={{ width: '48px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                                <div style={{
                                                                    height: '100%',
                                                                    width: `${peserta.nilaiTotal}%`,
                                                                    background: getScoreColor(peserta.nilaiTotal),
                                                                    borderRadius: '3px'
                                                                }}></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        ...getStatusStyle(peserta.status)
                                                    }}>
                                                        {peserta.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button style={{
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            color: '#3636e2'
                                                        }} title="Lihat Detail">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button style={{
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            color: '#ef4444'
                                                        }} title="Hapus">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                    Menampilkan {filteredPeserta.length} dari {pesertaList.length} peserta
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}>
                                        Sebelumnya
                                    </button>
                                    <button style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}>
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Upload Modal */}
            {showUploadModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Upload Data Peserta</h3>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadStatus('idle');
                                    setUploadMessage('');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {uploadStatus === 'idle' && (
                            <>
                                <div style={{
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '40px 24px',
                                    textAlign: 'center',
                                    marginBottom: '24px'
                                }}>
                                    <FileSpreadsheet size={48} color="#3636e2" style={{ margin: '0 auto 16px' }} />
                                    <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
                                        Pilih file Excel atau CSV
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px' }}>
                                        Format: .xlsx, .xls, atau .csv
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".xlsx,.xls,.csv"
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            background: '#3636e2',
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Pilih File
                                    </button>
                                </div>

                                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px' }}>Format kolom yang diperlukan:</p>
                                    <ul style={{ fontSize: '13px', color: '#64748b', margin: 0, paddingLeft: '20px' }}>
                                        <li>Nama Lengkap</li>
                                        <li>NIK (16 digit)</li>
                                        <li>Alamat</li>
                                        <li>No HP</li>
                                        <li>Pendidikan Terakhir</li>
                                        <li>Posisi yang Dilamar</li>
                                        <li>Tanggal Wawancara (opsional)</li>
                                        <li>Waktu Wawancara (opsional)</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {uploadStatus === 'uploading' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    border: '4px solid #e2e8f0',
                                    borderTopColor: '#3636e2',
                                    borderRadius: '50%',
                                    margin: '0 auto 16px',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <p style={{ fontSize: '16px', fontWeight: 500 }}>{uploadMessage}</p>
                            </div>
                        )}

                        {uploadStatus === 'success' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: '16px', fontWeight: 500, color: '#22c55e' }}>{uploadMessage}</p>
                            </div>
                        )}

                        {uploadStatus === 'error' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: '16px', fontWeight: 500, color: '#ef4444' }}>{uploadMessage}</p>
                                <button
                                    onClick={() => setUploadStatus('idle')}
                                    style={{
                                        background: '#3636e2',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        marginTop: '16px'
                                    }}
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
