'use client';

import CandidateQueueStatus from '@/components/CandidateQueueStatus';

export default function QueueStatusPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Status Antrean</h1>
                <p className="text-slate-400">Pantau status wawancara Anda secara real-time</p>
            </div>

            <CandidateQueueStatus />
        </div>
    );
}
