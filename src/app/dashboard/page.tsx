'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import StatCard from '@/components/StatCard';
import QueueDisplay from '@/components/QueueDisplay';
import InterviewerControls from '@/components/InterviewerControls';
import CandidateQueueStatus from '@/components/CandidateQueueStatus';
import { Profile, DashboardStats, InterviewerState } from '@/types';
import {
    Users,
    Clock,
    CheckCircle2,
    UserCheck,
    Briefcase,
    TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalCandidates: 0,
        waitingCount: 0,
        interviewingCount: 0,
        completedCount: 0,
        availableInterviewers: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (isLoaded && user?.id) {
            loadProfile();
            loadStats();
        }
    }, [isLoaded, user?.id]);

    const loadProfile = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
        } else if (error?.code === 'PGRST116') {
            // Profile doesn't exist, create it
            await createProfile();
        }
        setLoading(false);
    };

    const createProfile = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                full_name: user.fullName || user.firstName || 'User',
                role: 'candidate'
            })
            .select()
            .single();

        if (data) {
            setProfile(data);
        }
    };

    const loadStats = async () => {
        // Get waiting count
        const { count: waitingCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'waiting');

        // Get interviewing count
        const { count: interviewingCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'interviewing');

        // Get completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: completedCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed')
            .gte('created_at', today.toISOString());

        // Get available interviewers
        const { count: availableInterviewers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'interviewer')
            .eq('interviewer_status', 'idle');

        // Get total registered candidates for today
        const { count: totalCandidates } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        setStats({
            totalCandidates: totalCandidates || 0,
            waitingCount: waitingCount || 0,
            interviewingCount: interviewingCount || 0,
            completedCount: completedCount || 0,
            availableInterviewers: availableInterviewers || 0
        });
    };

    const handleStatusChange = (newStatus: InterviewerState) => {
        if (profile) {
            setProfile({ ...profile, interviewer_status: newStatus });
        }
    };

    if (loading || !isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="spinner" />
            </div>
        );
    }

    // Admin/Interviewer Dashboard
    if (profile?.role === 'admin' || profile?.role === 'interviewer') {
        return (
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Selamat Datang, {user?.firstName || 'User'}!
                    </h1>
                    <p className="text-slate-400">
                        {profile?.role === 'admin'
                            ? 'Kelola sistem antrean wawancara Anda'
                            : 'Panel kontrol pewawancara'
                        }
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Kandidat Hari Ini"
                        value={stats.totalCandidates}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Menunggu"
                        value={stats.waitingCount}
                        icon={Clock}
                        color="yellow"
                    />
                    <StatCard
                        title="Sedang Interview"
                        value={stats.interviewingCount}
                        icon={UserCheck}
                        color="orange"
                    />
                    <StatCard
                        title="Selesai"
                        value={stats.completedCount}
                        icon={CheckCircle2}
                        color="green"
                    />
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Queue Display */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                Antrean Saat Ini
                            </h2>
                            <span className="text-sm text-slate-400">
                                {stats.waitingCount} kandidat menunggu
                            </span>
                        </div>
                        <QueueDisplay showOnlyWaiting />
                    </div>

                    {/* Interviewer Controls */}
                    {profile?.role === 'interviewer' && (
                        <div className="space-y-4">
                            <InterviewerControls
                                currentStatus={profile.interviewer_status}
                                onStatusChange={handleStatusChange}
                            />

                            {/* Available Interviewers */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Pewawancara Online
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <UserCheck className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {stats.availableInterviewers}
                                        </p>
                                        <p className="text-sm text-slate-400">siap menerima</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Quick Actions */}
                    {profile?.role === 'admin' && (
                        <div className="space-y-4">
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Aksi Cepat
                                </h3>
                                <div className="space-y-3">
                                    <a
                                        href="/dashboard/jobs"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors group"
                                    >
                                        <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                                        <span className="text-sm text-slate-300">Kelola Lowongan</span>
                                    </a>
                                    <a
                                        href="/dashboard/interviewers"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors group"
                                    >
                                        <Users className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                                        <span className="text-sm text-slate-300">Kelola Pewawancara</span>
                                    </a>
                                    <a
                                        href="/dashboard/applications"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors group"
                                    >
                                        <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                                        <span className="text-sm text-slate-300">Lihat Statistik</span>
                                    </a>
                                </div>
                            </div>

                            {/* Interviewer Status */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Status Pewawancara
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(stats.availableInterviewers, 5))].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-slate-800 flex items-center justify-center text-xs text-white font-bold"
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        {stats.availableInterviewers} online
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Candidate Dashboard
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">
                    Halo, {user?.firstName || 'Kandidat'}!
                </h1>
                <p className="text-slate-400">
                    Pantau status lamaran dan antrean wawancara Anda
                </p>
            </motion.div>

            {/* Candidate Queue Status */}
            <CandidateQueueStatus />
        </div>
    );
}
