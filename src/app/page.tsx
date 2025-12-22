'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Bell,
  BarChart3
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Antrean Real-time",
      description: "Pantau status antrean secara langsung dengan update otomatis tanpa perlu refresh halaman."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Auto-Assign Cerdas",
      description: "Sistem otomatis menugaskan kandidat ke pewawancara yang tersedia untuk efisiensi maksimal."
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Notifikasi Instan",
      description: "Kandidat mendapat notifikasi langsung di HP saat giliran wawancara tiba."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Keamanan Terjamin",
      description: "Autentikasi aman dengan Clerk dan data terenkripsi di database Supabase."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboard Lengkap",
      description: "Pantau statistik rekrutmen dan performa pewawancara dalam satu tampilan."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Role",
      description: "Dukungan untuk Admin, Pewawancara, dan Kandidat dengan akses yang berbeda."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-500/5 to-transparent rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">InterviewQ</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="btn-ghost text-sm"
          >
            Masuk
          </Link>
          <Link
            href="/sign-up"
            className="btn-primary text-sm"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">Sistem Antrean Generasi Baru</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Kelola Antrean Wawancara
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Secara Real-time
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Platform modern untuk manajemen antrean wawancara dengan fitur auto-assign,
              notifikasi real-time, dan dashboard analytics yang lengkap.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="btn-primary text-lg flex items-center gap-2 group"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="btn-ghost text-lg"
              >
                Lihat Fitur
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { number: "1000+", label: "Kandidat Diproses" },
              { number: "50+", label: "Perusahaan Aktif" },
              { number: "99.9%", label: "Uptime" },
              { number: "<1s", label: "Response Time" }
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24 lg:px-12 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola proses rekrutmen yang efisien
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card glass-card-hover p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center text-orange-400 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cara Kerja
            </h2>
            <p className="text-lg text-slate-400">
              Proses sederhana dalam 4 langkah
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Daftar", description: "Kandidat mendaftar dan mengisi data lamaran online" },
              { step: "2", title: "Check-in", description: "Saat tiba di lokasi, kandidat scan QR atau klik check-in" },
              { step: "3", title: "Tunggu", description: "Kandidat menunggu dengan melihat status real-time di HP" },
              { step: "4", title: "Wawancara", description: "Sistem auto-assign dan notifikasi saat giliran tiba" }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-orange-500/30">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-indigo-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Siap Memulai?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Bergabunglah dengan ratusan perusahaan yang sudah menggunakan InterviewQ
                untuk proses rekrutmen yang lebih efisien.
              </p>
              <Link
                href="/sign-up"
                className="btn-primary text-lg inline-flex items-center gap-2 group"
              >
                Daftar Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 lg:px-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-400">
              © 2024 InterviewQ. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
