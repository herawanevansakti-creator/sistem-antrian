# Interview Queue System - Sistem Antrean Wawancara Real-time

Aplikasi modern untuk manajemen antrean wawancara dengan fitur real-time menggunakan **Next.js**, **Clerk**, dan **Supabase**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2-green?style=flat-square&logo=supabase)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square&logo=clerk)

## ✨ Fitur Utama

- 🔐 **Autentikasi Multi-Provider** - Login dengan Google, Email via Clerk
- 👥 **Multi-Role System** - Admin, Interviewer, Kandidat
- ⚡ **Real-time Updates** - Supabase Realtime untuk update instan
- 🎯 **Auto-Assign Cerdas** - Sistem otomatis menugaskan kandidat
- 🔔 **Notifikasi Browser** - Kandidat mendapat notifikasi saat dipanggil
- 📊 **Dashboard Analytics** - Statistik rekrutmen lengkap
- 📱 **Responsive Design** - Optimal di desktop dan mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **Hosting**: Vercel (recommended)

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd interview-queue
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka SQL Editor dan jalankan script `supabase-setup.sql`
3. Copy URL dan API keys dari Settings > API

### 4. Setup Clerk

1. Buat project baru di [Clerk](https://clerk.com)
2. Enable Google OAuth dan Email login
3. Buat Webhook untuk sync user:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Copy API keys dan Webhook Secret

### 5. Environment Variables

Buat file `.env.local` berdasarkan `env.example`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 🏗️ Struktur Proyek

```
src/
├── app/
│   ├── api/
│   │   └── webhooks/clerk/     # Clerk webhook handler
│   ├── dashboard/
│   │   ├── applications/       # Kelola aplikasi (Admin)
│   │   ├── apply/              # Lamar lowongan (Kandidat)
│   │   ├── interview/[id]/     # Sesi wawancara
│   │   ├── interviewers/       # Kelola pewawancara
│   │   ├── jobs/               # Kelola lowongan
│   │   ├── my-applications/    # Lamaran saya
│   │   ├── my-sessions/        # Sesi wawancara saya
│   │   ├── queue/              # Antrean (Interviewer)
│   │   └── queue-status/       # Status antrean (Kandidat)
│   ├── sign-in/
│   └── sign-up/
├── components/
│   ├── CandidateQueueStatus.tsx
│   ├── InterviewerControls.tsx
│   ├── QueueDisplay.tsx
│   ├── Sidebar.tsx
│   └── StatCard.tsx
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser client
│       └── server.ts           # Server client
├── types/
│   └── index.ts                # TypeScript types
└── middleware.ts               # Clerk auth middleware
```

## 👤 Roles & Permissions

### Admin
- Kelola lowongan
- Kelola aplikasi
- Monitor pewawancara
- Akses statistik lengkap

### Interviewer
- Lihat antrean
- Panggil kandidat (Auto-assign)
- Lakukan wawancara
- Beri penilaian

### Kandidat
- Daftar lowongan
- Check-in saat tiba
- Lihat status antrean real-time
- Terima notifikasi

## 🔄 Alur Sistem

1. **Kandidat Daftar** → Status: `registered`
2. **Check-in di Lokasi** → Status: `waiting`
3. **Interviewer Klik "Siap"** → Sistem Auto-Assign → Status: `assigned`
4. **Kandidat Menerima Notifikasi** → Masuk Ruangan
5. **Wawancara Dimulai** → Status: `interviewing`
6. **Wawancara Selesai** → Status: `completed`

## 🚀 Deployment

### Vercel (Recommended)

1. Push ke GitHub
2. Import project di Vercel
3. Tambahkan Environment Variables
4. Deploy!

### Environment Variables di Vercel

Pastikan semua env variables dari `.env.local` ditambahkan di Vercel Dashboard > Settings > Environment Variables.

## 📝 Custom User Roles di Clerk

Untuk menambahkan Interviewer atau Admin:

1. Buka Clerk Dashboard
2. Users > Pilih User
3. Edit Public Metadata:
```json
{
  "role": "interviewer"
}
```
atau
```json
{
  "role": "admin"
}
```

4. User akan otomatis sync ke Supabase via webhook

## 🤝 Kontribusi

Pull requests welcome! Untuk perubahan besar, silakan buka issue terlebih dahulu.

## 📄 License

[MIT](LICENSE)
