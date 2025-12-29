'use client';

import { useState, useEffect } from 'react';
import CandidateDashboard from '@/components/CandidateDashboard';

export default function PesertaPage() {
    const [notification, setNotification] = useState<string | null>(null);

    const notify = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: 24,
                    right: 24,
                    zIndex: 200,
                    background: '#0f172a',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 12,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderLeft: '4px solid #3636e2'
                }}>
                    {notification}
                </div>
            )}

            <CandidateDashboard notify={notify} />
        </div>
    );
}
