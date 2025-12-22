'use client';

import QueueDisplay from '@/components/QueueDisplay';
import InterviewerControls from '@/components/InterviewerControls';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Profile, InterviewerState } from '@/types';
import { useRouter } from 'next/navigation';

export default function QueuePage() {
    const { user } = useUser();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (user?.id) {
            loadProfile();
        }
    }, [user?.id]);

    const loadProfile = async () => {
        if (!user?.id) return;

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
        }
        setLoading(false);
    };

    const handleStatusChange = (newStatus: InterviewerState) => {
        if (profile) {
            setProfile({ ...profile, interviewer_status: newStatus });
        }
    };

    const handleCandidateAssigned = (applicationId: number) => {
        router.push(`/dashboard/interview/${applicationId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Antrean Wawancara</h1>
                <p className="text-slate-400">Lihat antrean dan panggil kandidat berikutnya</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Queue Display */}
                <div className="lg:col-span-2">
                    <QueueDisplay showOnlyWaiting />
                </div>

                {/* Controls */}
                <div>
                    {profile && (
                        <InterviewerControls
                            currentStatus={profile.interviewer_status}
                            onStatusChange={handleStatusChange}
                            onCandidateAssigned={handleCandidateAssigned}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
