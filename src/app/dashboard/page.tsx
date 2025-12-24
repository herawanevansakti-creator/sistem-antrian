'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        if (isLoaded) {
            // Redirect to home page where the main app handles role-based views
            router.replace('/');
        }
    }, [isLoaded, router]);

    return (
        <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#3636e2] animate-spin mx-auto mb-4" />
                <p className="text-[#505095] font-medium">Mengalihkan ke dashboard...</p>
            </div>
        </div>
    );
}
