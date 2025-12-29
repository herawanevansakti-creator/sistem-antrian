'use client';

import React, { useState } from 'react';
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
    Database
} from 'lucide-react';
import type { Profile } from '@/types';

interface AdminDashboardProps {
    profile: Profile;
}

export default function AdminDashboard({ profile }: AdminDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [tableSearch, setTableSearch] = useState('');

    // Mock data for stats
    const stats = {
        avgScore: 78,
        avgDuration: '45m',
        totalApplicants: 1240
    };

    // Mock data for job popularity
    const jobPopularity = [
        { role: 'Soft. Eng', percentage: 85, color: '#3636e2' },
        { role: 'Prod. Mgr', percentage: 65, color: '#818cf8' },
        { role: 'Designer', percentage: 45, color: '#38bdf8' },
        { role: 'Sales', percentage: 30, color: '#93c5fd' }
    ];

    // Mock data for participant history
    const participants = [
        {
            id: 1,
            name: 'Alice Johnson',
            email: 'alice.j@example.com',
            role: 'Software Engineer',
            date: 'Oct 24, 2023',
            duration: '55m',
            score: 92,
            status: 'Passed',
            avatar: null
        },
        {
            id: 2,
            name: 'Mark Smith',
            email: 'mark.s@example.com',
            role: 'Product Manager',
            date: 'Oct 23, 2023',
            duration: '45m',
            score: 85,
            status: 'Reviewing',
            avatar: null
        },
        {
            id: 3,
            name: 'Sarah Lee',
            email: 'sarah.lee@design.co',
            role: 'UX Designer',
            date: 'Oct 22, 2023',
            duration: '30m',
            score: 45,
            status: 'Rejected',
            avatar: null
        },
        {
            id: 4,
            name: 'David Chen',
            email: 'd.chen@data.io',
            role: 'Data Scientist',
            date: 'Oct 21, 2023',
            duration: '62m',
            score: 88,
            status: 'Passed',
            avatar: null
        }
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Passed':
                return { background: '#dcfce7', color: '#166534' };
            case 'Reviewing':
                return { background: '#dbeafe', color: '#1e40af' };
            case 'Rejected':
                return { background: '#fee2e2', color: '#991b1b' };
            default:
                return { background: '#f1f5f9', color: '#475569' };
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#3636e2';
        return '#ef4444';
    };

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
                width: '256px',
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
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: '#3636e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Database size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>RecruitFlow</h1>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Admin Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(54, 54, 226, 0.1)',
                        color: '#3636e2',
                        textDecoration: 'none'
                    }}>
                        <LayoutGrid size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Dashboard</span>
                    </a>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#475569',
                        textDecoration: 'none'
                    }}>
                        <Video size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Active Interviews</span>
                    </a>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#475569',
                        textDecoration: 'none'
                    }}>
                        <Users size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Candidates</span>
                    </a>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#475569',
                        textDecoration: 'none'
                    }}>
                        <Settings size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Settings</span>
                    </a>
                    <a href="#" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#475569',
                        textDecoration: 'none'
                    }}>
                        <QrCode size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>QR Code Generator</span>
                    </a>
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
                                {profile.full_name || 'Admin'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                admin@recruitflow.com
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
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Overview</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
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
                                    width: '256px',
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
                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {/* Stat Card 1 - Average Score */}
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
                                        <BarChart2 size={20} />
                                    </div>
                                    <span style={{
                                        background: '#dcfce7',
                                        color: '#166534',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}>
                                        +5% vs last week
                                    </span>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Average Score</p>
                                <h3 style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>
                                    {stats.avgScore}<span style={{ fontSize: '20px', fontWeight: 400, color: '#94a3b8' }}>/100</span>
                                </h3>
                            </div>

                            {/* Stat Card 2 - Avg Duration */}
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
                                        background: '#fff7ed',
                                        borderRadius: '8px',
                                        color: '#ea580c'
                                    }}>
                                        <Timer size={20} />
                                    </div>
                                    <span style={{
                                        background: '#fee2e2',
                                        color: '#be123c',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}>
                                        -2m vs last week
                                    </span>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Avg. Duration</p>
                                <h3 style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{stats.avgDuration}</h3>
                            </div>

                            {/* Stat Card 3 - Total Applicants */}
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
                                        background: '#faf5ff',
                                        borderRadius: '8px',
                                        color: '#9333ea'
                                    }}>
                                        <UserPlus size={20} />
                                    </div>
                                    <span style={{
                                        background: '#dcfce7',
                                        color: '#166534',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}>
                                        +12% vs last week
                                    </span>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Total Applicants</p>
                                <h3 style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{stats.totalApplicants.toLocaleString()}</h3>
                            </div>
                        </section>

                        {/* Charts Row */}
                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                            {/* Line Chart - Interview Volume */}
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>Interview Volume</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Interviews conducted over the last 7 days</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>152</p>
                                        <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 500, margin: 0 }}>+12%</p>
                                    </div>
                                </div>
                                <div style={{ flex: 1, minHeight: '200px', position: 'relative' }}>
                                    <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#3636e2" stopOpacity="0.1" />
                                                <stop offset="100%" stopColor="#3636e2" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0 120 C40 120 40 50 80 50 C120 50 120 90 160 90 C200 90 200 30 240 30 C280 30 280 80 320 80 C360 80 360 40 400 40 L400 150 L0 150 Z" fill="url(#chartGradient)" />
                                        <path d="M0 120 C40 120 40 50 80 50 C120 50 120 90 160 90 C200 90 200 30 240 30 C280 30 280 80 320 80 C360 80 360 40 400 40" fill="none" stroke="#3636e2" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx="80" cy="50" r="4" fill="white" stroke="#3636e2" strokeWidth="2" />
                                        <circle cx="160" cy="90" r="4" fill="white" stroke="#3636e2" strokeWidth="2" />
                                        <circle cx="240" cy="30" r="4" fill="white" stroke="#3636e2" strokeWidth="2" />
                                        <circle cx="320" cy="80" r="4" fill="white" stroke="#3636e2" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', padding: '0 8px' }}>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                        <span key={day} style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{day}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Bar Chart - Job Popularity */}
                            <div style={{
                                background: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>Job Popularity</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Applications by role</p>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                                    {jobPopularity.map((job) => (
                                        <div key={job.role} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ width: '80px', fontSize: '14px', fontWeight: 500, color: '#475569' }}>{job.role}</span>
                                            <div style={{ flex: 1, height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${job.percentage}%`,
                                                    background: job.color,
                                                    borderRadius: '6px'
                                                }}></div>
                                            </div>
                                            <span style={{ width: '36px', fontSize: '12px', fontWeight: 700, textAlign: 'right' }}>{job.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
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
                                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Participant History</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Search */}
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search applicants..."
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
                                                width: '240px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    {/* Filter Button */}
                                    <button style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}>
                                        <Filter size={16} />
                                        Filter
                                    </button>
                                    {/* Export Button */}
                                    <button style={{
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
                                    }}>
                                        <Download size={16} />
                                        Export
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Candidate</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Role Applied</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Date</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Duration</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Score</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Status</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((participant) => (
                                            <tr key={participant.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
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
                                                            {participant.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>{participant.name}</p>
                                                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{participant.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{participant.role}</td>
                                                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{participant.date}</td>
                                                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{participant.duration}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{participant.score}</span>
                                                        <div style={{ width: '64px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                height: '100%',
                                                                width: `${participant.score}%`,
                                                                background: getScoreColor(participant.score),
                                                                borderRadius: '3px'
                                                            }}></div>
                                                        </div>
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
                                                        ...getStatusStyle(participant.status)
                                                    }}>
                                                        {participant.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                    <button style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        color: '#94a3b8'
                                                    }}>
                                                        <Eye size={18} />
                                                    </button>
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
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Showing 4 of 124 candidates</p>
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
                                        Previous
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
                                        Next
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
