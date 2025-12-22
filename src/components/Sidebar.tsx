'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    ClipboardList,
    Settings,
    Menu,
    X,
    Users2,
    Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, UserRole } from '@/types';

interface SidebarProps {
    userRole?: UserRole;
}

export default function Sidebar({ userRole = 'candidate' }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadProfile();
        }
    }, [user?.id]);

    const loadProfile = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();

        if (data) {
            setProfile(data);
        }
    };

    const role = profile?.role || userRole;

    const getNavItems = () => {
        const commonItems = [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
        ];

        if (role === 'admin') {
            return [
                ...commonItems,
                { href: '/dashboard/jobs', label: 'Lowongan', icon: Briefcase },
                { href: '/dashboard/applications', label: 'Aplikasi', icon: ClipboardList },
                { href: '/dashboard/interviewers', label: 'Pewawancara', icon: Users2 },
                { href: '/dashboard/candidates', label: 'Kandidat', icon: Users },
                { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings }
            ];
        }

        if (role === 'interviewer') {
            return [
                ...commonItems,
                { href: '/dashboard/queue', label: 'Antrean', icon: Clock },
                { href: '/dashboard/my-sessions', label: 'Sesi Saya', icon: ClipboardList }
            ];
        }

        // Candidate
        return [
            ...commonItems,
            { href: '/dashboard/my-applications', label: 'Lamaran Saya', icon: ClipboardList },
            { href: '/dashboard/queue-status', label: 'Status Antrean', icon: Clock }
        ];
    };

    const navItems = getNavItems();

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 border border-slate-700"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 glass-card rounded-none lg:rounded-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white">InterviewQ</span>
                            <span className="block text-xs text-slate-400 capitalize">{role}</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-10 h-10"
                                    }
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
