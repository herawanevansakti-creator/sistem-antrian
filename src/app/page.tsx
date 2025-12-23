'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import {
  User,
  Users,
  Clock,
  Play,
  Settings,
  Bell,
  BarChart3,
  Search,
  Eye,
  MapPin,
  QrCode,
  Download,
  TrendingUp,
  X,
  Star,
  Loader2
} from 'lucide-react';

import {
  useProfile,
  useJobs,
  useCandidateApplication,
  useQueue,
  useActiveSession,
  useAnalytics,
  checkInWithLocation,
  requestNextCandidate,
  completeInterviewSession,
  updateInterviewerStatus
} from '@/lib/hooks';

import type { ScoreSummary, Application, Job } from '@/types';

export default function RecruitFlowApp() {
  return (
    <>
      <SignedIn>
        <MainApp />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function MainApp() {
  const { user, isLoaded } = useUser();
  const { profile, loading: profileLoading } = useProfile(user?.id || null);

  // UI States
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<Application | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Loading state
  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  // If no profile, show role selection
  if (!profile) {
    return <RoleSelection userId={user?.id} userEmail={user?.primaryEmailAddress?.emailAddress} userName={user?.fullName} />;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="font-sans">
      {notification && (
        <div className="fixed top-24 right-6 z-[200]">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-indigo-500">
            <Bell className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold">{notification}</span>
          </div>
        </div>
      )}

      {profile.role === 'candidate' && (
        <CandidateView
          profile={profile}
          notify={notify}
          isScanning={isScanning}
          setIsScanning={setIsScanning}
          locationVerified={locationVerified}
          setLocationVerified={setLocationVerified}
          locationLoading={locationLoading}
          setLocationLoading={setLocationLoading}
        />
      )}

      {profile.role === 'interviewer' && (
        <InterviewerView
          profile={profile}
          notify={notify}
          interviewTime={interviewTime}
          setInterviewTime={setInterviewTime}
          timerRef={timerRef}
          formatTime={formatTime}
        />
      )}

      {profile.role === 'admin' && (
        <AdminView
          profile={profile}
          selectedResult={selectedResult}
          setSelectedResult={setSelectedResult}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}

// ===== ROLE SELECTION (for new users) =====
function RoleSelection({ userId, userEmail, userName }: { userId?: string; userEmail?: string; userName?: string | null }) {
  const [loading, setLoading] = useState(false);
  const { createClient } = require('@/lib/supabase/client');
  const supabase = createClient();

  const handleSelectRole = async (role: 'candidate' | 'interviewer' | 'admin') => {
    if (!userId) return;

    setLoading(true);

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email: userEmail,
      full_name: userName,
      role: role,
      interviewer_status: role === 'interviewer' ? 'idle' : 'offline'
    });

    if (error) {
      console.error('Error creating profile:', error);
    }

    // Reload page to fetch new profile
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center space-y-8">
        <div className="space-y-2">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl rotate-3">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-indigo-950 tracking-tighter italic">RecruitFlow</h1>
          <p className="text-gray-400 font-medium">Pilih peran Anda</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => handleSelectRole('candidate')}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-between hover:border-indigo-600 hover:bg-indigo-50 transition-all group disabled:opacity-50"
          >
            <span className="text-gray-900 group-hover:text-indigo-600">Kandidat</span>
            <User className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
          </button>
          <button
            onClick={() => handleSelectRole('interviewer')}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-between hover:border-indigo-600 hover:bg-indigo-50 transition-all group disabled:opacity-50"
          >
            <span className="text-gray-900 group-hover:text-indigo-600">Pewawancara</span>
            <Users className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
          </button>
          <button
            onClick={() => handleSelectRole('admin')}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-between hover:border-indigo-600 hover:bg-indigo-50 transition-all group disabled:opacity-50"
          >
            <span className="text-gray-900 group-hover:text-indigo-600">Administrator</span>
            <Settings className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
          </button>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 text-indigo-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Menyimpan...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== NAVBAR =====
function Navbar({ profile }: { profile: { full_name: string | null; role: string } }) {
  return (
    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
          <TrendingUp className="text-white w-5 h-5" />
        </div>
        <span className="font-black text-xl tracking-tighter text-indigo-900">RECRUITFLOW</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold leading-none text-gray-900">{profile.full_name || 'User'}</p>
          <span className="text-[10px] font-black text-indigo-500 uppercase">{profile.role}</span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}

// ===== CANDIDATE VIEW =====
interface CandidateViewProps {
  profile: { id: string; full_name: string | null; role: string };
  notify: (msg: string) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
  locationVerified: boolean;
  setLocationVerified: (v: boolean) => void;
  locationLoading: boolean;
  setLocationLoading: (v: boolean) => void;
}

function CandidateView({
  profile,
  notify,
  isScanning,
  setIsScanning,
  locationVerified,
  setLocationVerified,
  locationLoading,
  setLocationLoading
}: CandidateViewProps) {
  const { application, loading } = useCandidateApplication(profile.id);
  const { jobs } = useJobs();
  const [checkingIn, setCheckingIn] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const verifyLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      notify("Geolocation tidak didukung browser Anda.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationVerified(true);
        setLocationLoading(false);
        notify("Lokasi terverifikasi! Anda berada di area kantor.");
      },
      () => {
        notify("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
        setLocationLoading(false);
      }
    );
  };

  const handleCheckIn = async (jobId: number) => {
    if (!userLocation) return;

    setCheckingIn(true);
    const result = await checkInWithLocation(
      profile.id,
      jobId,
      userLocation.lat,
      userLocation.lng
    );

    if (result.status === 'success') {
      notify(`Check-in berhasil! Nomor antrean: ${result.queue_number}`);
      setIsScanning(false);
    } else {
      notify(result.message || 'Gagal check-in');
    }
    setCheckingIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {!application ? (
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-gray-800">Check-in Kehadiran</h2>
              <p className="text-gray-500 text-sm">Gunakan QR Code di lobby dan verifikasi lokasi Anda.</p>
            </div>

            {/* STEP 1: GEOFENCING */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${locationVerified ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className={locationVerified ? 'text-green-600' : 'text-orange-600'} />
                  <div>
                    <p className="font-bold text-sm text-gray-900">Status Lokasi</p>
                    <p className="text-xs text-gray-500">{locationVerified ? 'Anda berada di area kantor' : 'Verifikasi lokasi diperlukan'}</p>
                  </div>
                </div>
                {!locationVerified && (
                  <button onClick={verifyLocation} disabled={locationLoading} className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50">
                    {locationLoading ? 'Mengecek...' : 'Cek GPS'}
                  </button>
                )}
              </div>
            </div>

            {/* STEP 2: QR SCANNER SIMULATION */}
            {locationVerified && (
              <div className="space-y-4">
                {!isScanning ? (
                  <button
                    onClick={() => setIsScanning(true)}
                    className="w-full py-12 border-4 border-dashed border-indigo-100 rounded-3xl flex flex-col items-center justify-center gap-4 text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <QrCode className="w-16 h-16" />
                    <span className="font-black uppercase tracking-widest text-xs">Pindai QR Lokasi</span>
                  </button>
                ) : (
                  <div className="relative aspect-square bg-black rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-bounce" />
                      </div>
                    </div>
                    <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-4">
                      <p className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Pilih Posisi yang Dilamar</p>
                      <div className="grid grid-cols-1 gap-2 w-full px-12 max-h-48 overflow-y-auto">
                        {jobs.map(j => (
                          <button
                            key={j.id}
                            onClick={() => handleCheckIn(j.id)}
                            disabled={checkingIn}
                            className="bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all disabled:opacity-50"
                          >
                            {checkingIn ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : j.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={`p-10 rounded-[40px] shadow-2xl text-white ${application.status === 'assigned' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Queue Number</p>
                <h1 className="text-8xl font-black mt-2 tracking-tighter italic">{application.queue_number}</h1>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                <Clock className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-8 text-sm text-white/70">
              <p>Posisi: <span className="font-bold text-white">{application.job?.title}</span></p>
            </div>
            <div className="mt-8 bg-white/10 p-6 rounded-3xl border border-white/10 flex items-center gap-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
              <p className="font-bold">
                {application.status === 'assigned' ? "GILIRAN ANDA! SILAKAN MASUK." : "Mohon menunggu, posisi Anda terpantau."}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ===== INTERVIEWER VIEW =====
interface InterviewerViewProps {
  profile: { id: string; full_name: string | null; role: string };
  notify: (msg: string) => void;
  interviewTime: number;
  setInterviewTime: React.Dispatch<React.SetStateAction<number>>;
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  formatTime: (seconds: number) => string;
}

function InterviewerView({ profile, notify, interviewTime, setInterviewTime, timerRef, formatTime }: InterviewerViewProps) {
  const { activeApp, loading: sessionLoading } = useActiveSession(profile.id);
  const { queue } = useQueue();
  const [localScores, setLocalScores] = useState<ScoreSummary>({ technical: 0, communication: 0, attitude: 0, notes: '' });
  const [processing, setProcessing] = useState(false);

  // Timer effect
  useEffect(() => {
    if (activeApp) {
      timerRef.current = setInterval(() => {
        setInterviewTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setInterviewTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeApp, setInterviewTime, timerRef]);

  const handleNextCandidate = async () => {
    setProcessing(true);
    const result = await requestNextCandidate(profile.id);

    if (result.status === 'success') {
      notify("Kandidat dipanggil! Silakan mulai wawancara.");
      setInterviewTime(0);
    } else {
      notify(result.message || "Tidak ada antrean.");
    }
    setProcessing(false);
  };

  const handleCompleteSession = async () => {
    if (!activeApp) return;

    setProcessing(true);
    const result = await completeInterviewSession(
      activeApp.id,
      profile.id,
      interviewTime,
      localScores
    );

    if (result.status === 'success') {
      notify("Sesi wawancara selesai!");
      setLocalScores({ technical: 0, communication: 0, attitude: 0, notes: '' });
    } else {
      notify(result.message || "Gagal menyimpan sesi.");
    }
    setProcessing(false);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar profile={profile} />
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {!activeApp ? (
            <div className="bg-white h-[500px] rounded-[40px] flex flex-col items-center justify-center p-12 text-center space-y-6 shadow-sm border border-gray-100">
              <div className="bg-indigo-50 p-6 rounded-full">
                <Play className="w-12 h-12 text-indigo-600 fill-current" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Sesi Berikutnya?</h2>
                <p className="text-gray-400 mt-2 max-w-xs mx-auto">Pastikan Anda sudah siap secara teknis sebelum memanggil kandidat.</p>
              </div>
              <button
                onClick={handleNextCandidate}
                disabled={processing}
                className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Panggil Sekarang'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full">
              {/* TIMER HEADER */}
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div>
                  <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Sesi Berlangsung</span>
                  <h2 className="text-3xl font-black">{activeApp.queue_number}</h2>
                  <p className="text-sm text-gray-400 mt-1">{activeApp.candidate?.full_name || 'Kandidat'}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Durasi Wawancara</p>
                  <p className="text-4xl font-mono font-black text-green-400">{formatTime(interviewTime)}</p>
                </div>
              </div>

              {/* SCORING CONTENT */}
              <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest">Penilaian</h3>
                    <div className="space-y-6">
                      <StarRating label="Technical Skill" value={localScores.technical} onChange={(v) => setLocalScores({ ...localScores, technical: v })} />
                      <StarRating label="Communication" value={localScores.communication} onChange={(v) => setLocalScores({ ...localScores, communication: v })} />
                      <StarRating label="Attitude" value={localScores.attitude} onChange={(v) => setLocalScores({ ...localScores, attitude: v })} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest">Internal Notes</h3>
                    <textarea
                      className="w-full h-48 bg-slate-50 border-2 border-gray-100 rounded-3xl p-5 outline-none focus:border-indigo-500 transition-all text-sm text-gray-900"
                      placeholder="Feedback teknis..."
                      value={localScores.notes}
                      onChange={(e) => setLocalScores({ ...localScores, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t">
                <button
                  onClick={handleCompleteSession}
                  disabled={processing}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan & Akhiri Sesi'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Antrean Hari Ini
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {queue.map(app => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white w-10 h-10 flex items-center justify-center rounded-xl font-black text-indigo-600 shadow-sm border border-indigo-50 text-xs">{app.queue_number}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">{app.candidate?.full_name || 'Kandidat'}</p>
                      <span className="text-[10px] text-gray-500">{app.checked_in_at ? new Date(app.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-orange-600 uppercase">Waiting</span>
                </div>
              ))}
              {queue.length === 0 && <p className="text-center text-gray-400 text-xs py-4">Belum ada antrean baru.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ===== ADMIN VIEW =====
interface AdminViewProps {
  profile: { id: string; full_name: string | null; role: string };
  selectedResult: Application | null;
  setSelectedResult: (app: Application | null) => void;
  formatTime: (seconds: number) => string;
}

function AdminView({ profile, selectedResult, setSelectedResult, formatTime }: AdminViewProps) {
  const { jobAnalytics, todayStats, completedApps, loading } = useAnalytics();
  const { jobs } = useJobs();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar profile={profile} />
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Dashboard Analitik</h2>
            <p className="text-gray-500 text-sm">Monitor performa rekrutmen secara real-time.</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Download className="w-4 h-4" /> Download Report (CSV)
          </button>
        </div>

        {/* Analytics Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">Rata-rata Skor</p>
            <div className="flex items-end gap-2 mt-2">
              <h3 className="text-4xl font-black text-indigo-600">{todayStats?.avg_score?.toFixed(1) || '0.0'}</h3>
              <span className="text-gray-400 font-bold mb-1">/ 5.0</span>
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${((todayStats?.avg_score || 0) / 5) * 100}%` }} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">Durasi Rata-rata</p>
            <h3 className="text-4xl font-black text-gray-800 mt-2">{formatTime(todayStats?.avg_duration_seconds || 0)}</h3>
            <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {todayStats?.completed_today || 0} selesai hari ini
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">Popularitas Posisi</p>
            <div className="mt-3 space-y-2">
              {jobAnalytics.slice(0, 5).map(j => (
                <div key={j.job_id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 w-24 truncate">{j.job_title}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400" style={{ width: `${Math.min((j.total_applicants / 15) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{j.total_applicants}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b flex items-center justify-between">
            <h3 className="font-black text-xl text-gray-800">Riwayat Peserta</h3>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-40 text-gray-900" />
            </div>
          </div>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">
                <tr>
                  <th className="p-6">Nomor</th>
                  <th className="p-6">Nama</th>
                  <th className="p-6">Posisi</th>
                  <th className="p-6">Durasi</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {completedApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6 font-black text-indigo-900">{app.queue_number}</td>
                    <td className="p-6 text-sm font-bold text-gray-600">{app.candidate?.full_name || '-'}</td>
                    <td className="p-6 text-sm text-gray-600">{app.job?.title || '-'}</td>
                    <td className="p-6 font-mono text-xs text-slate-500">{app.duration ? formatTime(app.duration) : '--:--'}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${app.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => app.score_summary && setSelectedResult(app)}
                        disabled={!app.score_summary}
                        className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Detail */}
      {selectedResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-8 border-b bg-indigo-50/50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-indigo-950">Detail Penilaian</h3>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-white rounded-full transition-all">
                <X className="text-gray-400 w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Candidate</p>
                  <p className="text-xl font-bold text-gray-900">{selectedResult.queue_number}</p>
                  <p className="text-sm text-gray-500">{selectedResult.candidate?.full_name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Duration</p>
                  <p className="text-xl font-bold text-gray-900">{formatTime(selectedResult.duration || 0)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <StarRating label="Technical Skill" value={selectedResult.score_summary?.technical || 0} readOnly />
                <StarRating label="Communication" value={selectedResult.score_summary?.communication || 0} readOnly />
                <StarRating label="Attitude" value={selectedResult.score_summary?.attitude || 0} readOnly />
              </div>
              <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Reviewer Note</p>
                <p className="text-sm font-medium text-indigo-900 italic">&quot;{selectedResult.score_summary?.notes || 'No notes provided.'}&quot;</p>
              </div>
              <button onClick={() => setSelectedResult(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all">Close Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== STAR RATING COMPONENT =====
const StarRating = ({ label, value, onChange, readOnly = false }: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean
}) => (
  <div className="flex items-center justify-between">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((num) => (
        <Star
          key={num}
          onClick={() => !readOnly && onChange && onChange(num)}
          className={`w-5 h-5 ${value >= num ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} ${!readOnly && 'cursor-pointer hover:scale-110 transition-transform'}`}
        />
      ))}
    </div>
  </div>
);
