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
    Trash2,
    User,
    FileText,
    Image,
    RefreshCw
} from 'lucide-react';
import type { Profile } from '@/types';

interface AdminDashboardProps {
    profile: Profile;
}

interface Peserta {
    id: number;
    nik: string;
    sobatId: string;
    nama: string;
    pasfotoUrl?: string;
    ktpUrl?: string;
    ijazahUrl?: string;
    alamatLengkap: string;
    pendidikanTerakhir: string;
    pekerjaan: string;
    posisiDilamar: string;
    tanggalWawancara?: string;
    waktuWawancara?: string;
    nomorAntrean?: string;
    status: 'Terdaftar' | 'Hadir' | 'Menunggu' | 'Diwawancara' | 'Lulus' | 'Tidak Lulus' | 'Ditinjau' | 'Tidak Hadir';
    nilaiTotal?: number;
}

export default function AdminDashboard({ profile }: AdminDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [tableSearch, setTableSearch] = useState('');
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data peserta (nanti akan diambil dari Supabase)
    const [pesertaList, setPesertaList] = useState<Peserta[]>([
        {
            id: 1,
            nik: '3301017670101001',
            sobatId: '331023110301',
            nama: 'Pingki Setriana',
            pasfotoUrl: '',
            alamatLengkap: 'Jl. Merdeka No. 45, Cilacap, Jawa Tengah',
            pendidikanTerakhir: 'S1 Statistik',
            pekerjaan: 'Wiraswasta',
            posisiDilamar: 'Petugas Pencacah',
            tanggalWawancara: '29 Des 2025',
            waktuWawancara: '09:00',
            nomorAntrean: 'A-001',
            status: 'Menunggu',
            nilaiTotal: 0
        },
        {
            id: 2,
            nik: '3310105510920001',
            sobatId: '331022020080',
            nama: 'Heni Purnama Sari',
            pasfotoUrl: '',
            alamatLengkap: 'Jl. Diponegoro No. 12, Banyumas, Jawa Tengah',
            pendidikanTerakhir: 'D3 Akuntansi',
            pekerjaan: 'Mahasiswa',
            posisiDilamar: 'Pengawas',
            tanggalWawancara: '29 Des 2025',
            waktuWawancara: '09:30',
            nomorAntrean: 'A-002',
            status: 'Lulus',
            nilaiTotal: 85
        },
        {
            id: 3,
            nik: '3310011412950001',
            sobatId: '331022020069',
            nama: 'Daiyan Agung Santosa',
            pasfotoUrl: '',
            alamatLengkap: 'Jl. Sudirman No. 78, Purwokerto, Jawa Tengah',
            pendidikanTerakhir: 'SMA',
            pekerjaan: 'Freelancer',
            posisiDilamar: 'Petugas Pencacah',
            tanggalWawancara: '29 Des 2025',
            waktuWawancara: '10:00',
            nomorAntrean: 'A-003',
            status: 'Ditinjau',
            nilaiTotal: 72
        },
        {
            id: 4,
            nik: '3310081604970001',
            sobatId: '331022020071',
            nama: 'Matyas Wahyu Bagaskoro',
            pasfotoUrl: '',
            alamatLengkap: 'Jl. Veteran No. 23, Kebumen, Jawa Tengah',
            pendidikanTerakhir: 'S1 Ekonomi',
            pekerjaan: 'Pegawai Swasta',
            posisiDilamar: 'Pengawas',
            status: 'Terdaftar',
            nilaiTotal: 0
        },
        {
            id: 5,
            nik: '3310112509930001',
            sobatId: '331022020130',
            nama: 'Muhammad Yasser Arafat',
            pasfotoUrl: '',
            alamatLengkap: 'Jl. Ahmad Yani No. 56, Purbalingga, Jawa Tengah',
            pendidikanTerakhir: 'D3 Teknik',
            pekerjaan: 'Teknisi',
            posisiDilamar: 'Petugas Pencacah',
            status: 'Terdaftar',
            nilaiTotal: 0
        }
    ]);

    // Stats berdasarkan data peserta
    const stats = {
        totalPeserta: pesertaList.length,
        terdaftar: pesertaList.filter(p => p.status === 'Terdaftar').length,
        menunggu: pesertaList.filter(p => p.status === 'Menunggu').length,
        diwawancara: pesertaList.filter(p => p.status === 'Diwawancara').length,
        lulus: pesertaList.filter(p => p.status === 'Lulus').length,
        tidakLulus: pesertaList.filter(p => p.status === 'Tidak Lulus').length,
        sudahWawancara: pesertaList.filter(p => ['Lulus', 'Tidak Lulus', 'Ditinjau'].includes(p.status)).length
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
                return { background: '#e0e7ff', color: '#3730a3' };
            case 'Hadir':
                return { background: '#d1fae5', color: '#065f46' };
            case 'Tidak Hadir':
                return { background: '#fecaca', color: '#b91c1c' };
            case 'Terdaftar':
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

            setTimeout(() => {
                setShowUploadModal(false);
                setUploadStatus('idle');
                setUploadMessage('');
            }, 2000);
        }, 2000);
    };

    const handleExport = () => {
        const headers = ['No', 'NIK', 'Sobat-ID', 'Nama', 'Alamat', 'Pendidikan', 'Pekerjaan', 'Posisi', 'No Antrean', 'Status', 'Nilai'];
        const rows = pesertaList.map((p, i) => [
            i + 1,
            p.nik,
            p.sobatId,
            p.nama,
            p.alamatLengkap,
            p.pendidikanTerakhir,
            p.pekerjaan,
            p.posisiDilamar,
            p.nomorAntrean || '-',
            p.status,
            p.nilaiTotal || '-'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rekap_wawancara_bps_2026.csv';
        a.click();
    };

    const handleViewDetail = (peserta: Peserta) => {
        setSelectedPeserta(peserta);
        setShowDetailModal(true);
    };

    const filteredPeserta = pesertaList.filter(p =>
        p.nama.toLowerCase().includes(tableSearch.toLowerCase()) ||
        p.nik.includes(tableSearch) ||
        p.sobatId.includes(tableSearch) ||
        p.posisiDilamar.toLowerCase().includes(tableSearch.toLowerCase())
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
                        <span style={{
                            marginLeft: 'auto',
                            background: '#e0e7ff',
                            color: '#3636e2',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px'
                        }}>{pesertaList.length}</span>
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
                        {stats.diwawancara > 0 && (
                            <span style={{
                                marginLeft: 'auto',
                                background: '#fef3c7',
                                color: '#92400e',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '10px'
                            }}>{stats.diwawancara}</span>
                        )}
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
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Upload Data</span>
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
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>QR Check-in</span>
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
                        borderRadius: '12px'
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
                            {activeMenu === 'peserta' && 'Daftar Peserta'}
                            {activeMenu === 'interviews' && 'Wawancara Aktif'}
                            {activeMenu === 'qrcode' && 'QR Code Check-in'}
                            {activeMenu === 'settings' && 'Pengaturan'}
                        </h2>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                            Seleksi Wawancara Calon Petugas Mitra BPS 2026
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#475569',
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Stats Row */}
                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                            <div style={{
                                background: '#ffffff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <Users size={20} color="#3636e2" />
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>Total Peserta</p>
                                <h3 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{stats.totalPeserta}</h3>
                            </div>
                            <div style={{
                                background: '#ffffff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <Timer size={20} color="#f59e0b" />
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>Menunggu</p>
                                <h3 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{stats.menunggu}</h3>
                            </div>
                            <div style={{
                                background: '#ffffff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <Video size={20} color="#8b5cf6" />
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>Diwawancara</p>
                                <h3 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{stats.diwawancara}</h3>
                            </div>
                            <div style={{
                                background: '#ffffff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <CheckCircle size={20} color="#22c55e" />
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>Lulus</p>
                                <h3 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#22c55e' }}>{stats.lulus}</h3>
                            </div>
                            <div style={{
                                background: '#ffffff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <BarChart2 size={20} color="#3636e2" />
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>Sudah Wawancara</p>
                                <h3 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{stats.sudahWawancara}</h3>
                            </div>
                        </section>

                        {/* Participant Table */}
                        <section style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '16px'
                            }}>
                                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Daftar Peserta Wawancara</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Cari NIK/Nama/Sobat-ID..."
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
                                                fontSize: '13px',
                                                width: '220px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 14px',
                                            background: '#22c55e',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: '#ffffff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Upload size={14} />
                                        Upload
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 14px',
                                            background: '#3636e2',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: '#ffffff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Download size={14} />
                                        Ekspor
                                    </button>
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Peserta</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>NIK</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Sobat-ID</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Pendidikan</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Posisi</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Antrean</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Nilai</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Status</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPeserta.map((peserta) => (
                                            <tr key={peserta.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            background: peserta.pasfotoUrl ? `url(${peserta.pasfotoUrl})` : '#e0e7ff',
                                                            backgroundSize: 'cover',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#4f46e5',
                                                            fontSize: '13px',
                                                            fontWeight: 700
                                                        }}>
                                                            {!peserta.pasfotoUrl && peserta.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>{peserta.nama}</p>
                                                            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{peserta.pekerjaan}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>{peserta.nik}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#3636e2', fontWeight: 500 }}>{peserta.sobatId}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>{peserta.pendidikanTerakhir}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>{peserta.posisiDilamar}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    <span style={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        color: peserta.nomorAntrean ? '#3636e2' : '#94a3b8'
                                                    }}>
                                                        {peserta.nomorAntrean || '-'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    {peserta.nilaiTotal && peserta.nilaiTotal > 0 ? (
                                                        <span style={{
                                                            fontSize: '13px',
                                                            fontWeight: 700,
                                                            color: getScoreColor(peserta.nilaiTotal)
                                                        }}>
                                                            {peserta.nilaiTotal}
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        ...getStatusStyle(peserta.status)
                                                    }}>
                                                        {peserta.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleViewDetail(peserta)}
                                                            style={{
                                                                padding: '6px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: '#f1f5f9',
                                                                cursor: 'pointer',
                                                                color: '#3636e2'
                                                            }}
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            style={{
                                                                padding: '6px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: '#fee2e2',
                                                                cursor: 'pointer',
                                                                color: '#ef4444'
                                                            }}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{
                                padding: '12px 24px',
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
                                        borderRadius: '6px',
                                        background: 'transparent',
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}>Sebelumnya</button>
                                    <button style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        background: 'transparent',
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}>Selanjutnya</button>
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
                        maxWidth: '520px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Upload Data Peserta</h3>
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
                                    padding: '32px 24px',
                                    textAlign: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <FileSpreadsheet size={40} color="#3636e2" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px' }}>
                                        Pilih file Excel atau CSV
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                                        Ekspor dari aplikasi Sobat BPS
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
                                            padding: '10px 24px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Pilih File
                                    </button>
                                </div>

                                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px', color: '#374151' }}>Format kolom yang diperlukan:</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                                        <span>• NIK (16 digit)</span>
                                        <span>• Sobat-ID</span>
                                        <span>• Nama Lengkap</span>
                                        <span>• Pasfoto (URL)</span>
                                        <span>• KTP (URL)</span>
                                        <span>• Ijazah (URL)</span>
                                        <span>• Alamat Lengkap</span>
                                        <span>• Pendidikan Terakhir</span>
                                        <span>• Pekerjaan</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {uploadStatus === 'uploading' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    border: '4px solid #e2e8f0',
                                    borderTopColor: '#3636e2',
                                    borderRadius: '50%',
                                    margin: '0 auto 16px',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{uploadMessage}</p>
                            </div>
                        )}

                        {uploadStatus === 'success' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <CheckCircle size={56} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#22c55e' }}>{uploadMessage}</p>
                            </div>
                        )}

                        {uploadStatus === 'error' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <AlertCircle size={56} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#ef4444', marginBottom: '16px' }}>{uploadMessage}</p>
                                <button
                                    onClick={() => setUploadStatus('idle')}
                                    style={{
                                        background: '#3636e2',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedPeserta && (
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
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Detail Peserta</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
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

                        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                            <div style={{
                                width: '100px',
                                height: '120px',
                                borderRadius: '12px',
                                background: selectedPeserta.pasfotoUrl ? `url(${selectedPeserta.pasfotoUrl})` : '#e0e7ff',
                                backgroundSize: 'cover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {!selectedPeserta.pasfotoUrl && <User size={40} color="#4f46e5" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>{selectedPeserta.nama}</h4>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>{selectedPeserta.posisiDilamar}</p>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    ...getStatusStyle(selectedPeserta.status)
                                }}>
                                    {selectedPeserta.status}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>NIK</label>
                                <p style={{ fontSize: '14px', fontWeight: 500, margin: '4px 0 0', fontFamily: 'monospace' }}>{selectedPeserta.nik}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Sobat-ID</label>
                                <p style={{ fontSize: '14px', fontWeight: 500, margin: '4px 0 0', color: '#3636e2' }}>{selectedPeserta.sobatId}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Pendidikan Terakhir</label>
                                <p style={{ fontSize: '14px', fontWeight: 500, margin: '4px 0 0' }}>{selectedPeserta.pendidikanTerakhir}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Pekerjaan</label>
                                <p style={{ fontSize: '14px', fontWeight: 500, margin: '4px 0 0' }}>{selectedPeserta.pekerjaan}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Alamat Lengkap</label>
                                <p style={{ fontSize: '14px', fontWeight: 500, margin: '4px 0 0' }}>{selectedPeserta.alamatLengkap}</p>
                            </div>
                            {selectedPeserta.nomorAntrean && (
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Nomor Antrean</label>
                                    <p style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0 0', color: '#3636e2', fontFamily: 'monospace' }}>{selectedPeserta.nomorAntrean}</p>
                                </div>
                            )}
                            {selectedPeserta.nilaiTotal !== undefined && selectedPeserta.nilaiTotal > 0 && (
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Nilai Total</label>
                                    <p style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0', color: getScoreColor(selectedPeserta.nilaiTotal) }}>{selectedPeserta.nilaiTotal}</p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    background: 'transparent',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
