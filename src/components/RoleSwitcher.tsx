'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface RoleSwitcherProps {
    currentRole: string;
    onRoleChanged: () => void;
}

export default function RoleSwitcher({ currentRole, onRoleChanged }: RoleSwitcherProps) {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const roles = [
        { id: 'candidate', label: 'Kandidat', icon: '👤' },
        { id: 'interviewer', label: 'Pewawancara', icon: '👨‍💼' },
        { id: 'admin', label: 'Administrator', icon: '⚙️' },
    ];

    const handleSwitchRole = async (newRole: string) => {
        if (!user?.id || newRole === currentRole) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        console.log('[RoleSwitcher] Switching role from', currentRole, 'to', newRole, 'for user', user.id);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    role: newRole,
                    interviewer_status: newRole === 'interviewer' ? 'idle' : 'offline'
                })
                .eq('id', user.id)
                .select();

            console.log('[RoleSwitcher] Update result:', { data, error });

            if (error) {
                console.error('[RoleSwitcher] Update error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('[RoleSwitcher] No rows updated - this may be a RLS issue');
                toast.error('Gagal mengubah role - tidak ada data yang terupdate. Cek RLS policy di Supabase.');
                setLoading(false);
                return;
            }

            toast.success(`Role berhasil diubah ke ${roles.find(r => r.id === newRole)?.label}`);
            setIsOpen(false);

            // Wait a bit for the toast to show, then reload
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } catch (error: any) {
            toast.error(`Gagal mengubah role: ${error.message || 'Unknown error'}`);
            console.error('[RoleSwitcher] Error:', error);
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-colors"
                title="Switch Role (Development Only)"
            >
                <span>🔄</span>
                <span>Dev: Switch Role</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <p className="px-4 py-2 text-xs text-gray-500 font-medium border-b">
                            Switch Role
                        </p>
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleSwitchRole(role.id)}
                                disabled={loading || role.id === currentRole}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${role.id === currentRole ? 'bg-[#3636e2]/10 text-[#3636e2] font-medium' : 'text-gray-700'
                                    }`}
                            >
                                <span>{role.icon}</span>
                                <span>{role.label}</span>
                                {role.id === currentRole && (
                                    <span className="ml-auto text-xs text-[#3636e2]">✓ Current</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
