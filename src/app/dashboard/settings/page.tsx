'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
    Settings as SettingsIcon,
    Bell,
    Globe,
    Palette,
    Shield,
    Database,
    ExternalLink,
    Check
} from 'lucide-react';

export default function SettingsPage() {
    const { user } = useUser();
    const [settings, setSettings] = useState({
        notifications: true,
        soundEnabled: true,
        language: 'id',
        theme: 'dark',
        autoAssign: true,
    });

    const handleSave = () => {
        // In a real app, save to database/localStorage
        toast.success('Pengaturan berhasil disimpan');
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Pengaturan</h1>
                <p className="text-slate-400">Konfigurasi preferensi aplikasi Anda</p>
            </div>

            {/* Notifications */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-400" />
                    Notifikasi
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Notifikasi Browser</p>
                            <p className="text-sm text-slate-400">Terima notifikasi saat ada update penting</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Suara Notifikasi</p>
                            <p className="text-sm text-slate-400">Mainkan suara saat ada notifikasi baru</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.soundEnabled}
                                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                </div>
            </motion.div>

            {/* System Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-orange-400" />
                    Sistem
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Auto-Assign Kandidat</p>
                            <p className="text-sm text-slate-400">Otomatis tugaskan kandidat ke pewawancara</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.autoAssign}
                                onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                </div>
            </motion.div>

            {/* Appearance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-orange-400" />
                    Tampilan
                </h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-white font-medium mb-3">Tema</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                                className={`p-4 rounded-xl border transition-all ${settings.theme === 'dark'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700" />
                                    <span className="text-white">Gelap</span>
                                    {settings.theme === 'dark' && (
                                        <Check className="w-4 h-4 text-orange-400 ml-auto" />
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setSettings({ ...settings, theme: 'light' })}
                                className={`p-4 rounded-xl border transition-all ${settings.theme === 'light'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200" />
                                    <span className="text-white">Terang</span>
                                    {settings.theme === 'light' && (
                                        <Check className="w-4 h-4 text-orange-400 ml-auto" />
                                    )}
                                </div>
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">* Mode terang akan tersedia segera</p>
                    </div>
                </div>
            </motion.div>

            {/* Language */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-400" />
                    Bahasa
                </h2>
                <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="input-field w-full md:w-64"
                >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                </select>
            </motion.div>

            {/* External Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-400" />
                    Layanan Eksternal
                </h2>
                <div className="space-y-3">
                    <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Database className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Supabase Dashboard</p>
                                <p className="text-sm text-slate-400">Kelola database dan storage</p>
                            </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </a>
                    <a
                        href="https://clerk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Clerk Dashboard</p>
                                <p className="text-sm text-slate-400">Kelola user dan autentikasi</p>
                            </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </a>
                </div>
            </motion.div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary">
                    Simpan Pengaturan
                </button>
            </div>
        </div>
    );
}
