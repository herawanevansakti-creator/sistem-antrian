'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/types';
import { toast } from 'sonner';
import {
    Briefcase,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Search
} from 'lucide-react';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState({ title: '', is_active: true });
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setJobs(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingJob) {
            const { error } = await supabase
                .from('jobs')
                .update(formData)
                .eq('id', editingJob.id);

            if (!error) {
                toast.success('Lowongan berhasil diperbarui');
                loadJobs();
                closeModal();
            } else {
                toast.error('Gagal memperbarui lowongan');
            }
        } else {
            const { error } = await supabase
                .from('jobs')
                .insert(formData);

            if (!error) {
                toast.success('Lowongan berhasil ditambahkan');
                loadJobs();
                closeModal();
            } else {
                toast.error('Gagal menambahkan lowongan');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) return;

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (!error) {
            toast.success('Lowongan berhasil dihapus');
            loadJobs();
        } else {
            toast.error('Gagal menghapus lowongan');
        }
    };

    const toggleStatus = async (job: Job) => {
        const { error } = await supabase
            .from('jobs')
            .update({ is_active: !job.is_active })
            .eq('id', job.id);

        if (!error) {
            toast.success(`Lowongan ${!job.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
            loadJobs();
        }
    };

    const openModal = (job?: Job) => {
        if (job) {
            setEditingJob(job);
            setFormData({ title: job.title, is_active: job.is_active });
        } else {
            setEditingJob(null);
            setFormData({ title: '', is_active: true });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingJob(null);
        setFormData({ title: '', is_active: true });
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Kelola Lowongan</h1>
                    <p className="text-slate-400">Tambah dan kelola posisi yang tersedia</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Tambah Lowongan
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari lowongan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12"
                />
            </div>

            {/* Jobs Table */}
            <div className="glass-card overflow-hidden">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Posisi</th>
                                <th>Status</th>
                                <th>Dibuat</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map((job) => (
                                <motion.tr
                                    key={job.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <span className="font-medium text-white">{job.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleStatus(job)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${job.is_active
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-slate-500/20 text-slate-400'
                                                }`}
                                        >
                                            {job.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </td>
                                    <td className="text-slate-400">
                                        {new Date(job.created_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(job)}
                                                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredJobs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-400">
                                        {searchQuery ? 'Tidak ada lowongan yang cocok' : 'Belum ada lowongan'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content glass-card p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editingJob ? 'Edit Lowongan' : 'Tambah Lowongan'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nama Posisi
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    placeholder="Contoh: Frontend Developer"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500"
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-300">
                                    Lowongan Aktif
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn-ghost flex-1">
                                    Batal
                                </button>
                                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5" />
                                    {editingJob ? 'Simpan' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
