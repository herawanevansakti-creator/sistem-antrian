-- ============================================
-- DATA SAMPLE PESERTA - SELEKSI MITRA BPS 2026
-- ============================================
-- Jalankan script ini SETELAH bps-2026-schema.sql
-- Supabase Dashboard > SQL Editor > New Query
-- ============================================

-- Hapus data sample lama (jika ada)
DELETE FROM public.peserta WHERE nik LIKE '33%';

-- ============================================
-- INSERT 20 DATA SAMPLE PESERTA
-- ============================================
INSERT INTO public.peserta (
    nik, 
    sobat_id, 
    nama, 
    alamat_lengkap, 
    pendidikan_terakhir, 
    pekerjaan, 
    posisi_dilamar, 
    status
) VALUES
-- Peserta 1-5: Sudah Check-in (Menunggu)
('3301017670101001', '331023110301', 'Pingki Setriana', 'Jl. Merdeka No. 45, RT 03/RW 02, Kel. Sidanegara, Kec. Cilacap Tengah, Kab. Cilacap', 'S1 Statistika - Universitas Diponegoro', 'Wiraswasta', 'Petugas Pencacah', 'Menunggu'),
('3310105510920001', '331022020080', 'Heni Purnama Sari', 'Jl. Diponegoro No. 12, RT 05/RW 01, Kel. Karanglewas, Kec. Karanglewas, Kab. Banyumas', 'D3 Akuntansi - Politeknik Negeri Semarang', 'Mahasiswa', 'Pengawas', 'Menunggu'),
('3310011412950001', '331022020069', 'Daiyan Agung Santosa', 'Jl. Sudirman No. 78, RT 02/RW 04, Kel. Kranji, Kec. Purwokerto Timur, Kab. Banyumas', 'SMA - SMAN 1 Purwokerto', 'Freelancer', 'Petugas Pencacah', 'Menunggu'),
('3310081604970001', '331022020071', 'Matyas Wahyu Bagaskoro', 'Jl. Veteran No. 23, RT 01/RW 03, Kel. Kutosari, Kec. Kebumen, Kab. Kebumen', 'S1 Ekonomi - UGM', 'Pegawai Swasta', 'Pengawas', 'Menunggu'),
('3310112509930001', '331022020130', 'Muhammad Yasser Arafat', 'Jl. Ahmad Yani No. 56, RT 04/RW 02, Kel. Purbalingga Lor, Kec. Purbalingga, Kab. Purbalingga', 'D3 Teknik Elektro - Politeknik Negeri Jakarta', 'Teknisi', 'Petugas Pencacah', 'Menunggu'),

-- Peserta 6-10: Terdaftar (Belum Check-in)
('3302055308950001', '331022020059', 'Siti Rosyidah', 'Jl. Pahlawan No. 15, RT 06/RW 01, Kel. Gombong, Kec. Gombong, Kab. Kebumen', 'S1 Pendidikan - UNNES', 'Guru Honorer', 'Petugas Pencacah', 'Terdaftar'),
('3310094905760001', '331022040033', 'Winarti', 'Jl. Gatot Subroto No. 89, RT 03/RW 05, Kel. Karanganyar, Kec. Purwokerto Selatan, Kab. Banyumas', 'SMA - SMAN 2 Purwokerto', 'Ibu Rumah Tangga', 'Petugas Pencacah', 'Terdaftar'),
('3310090807870001', '331022020079', 'Jarot Tri Yuliawan', 'Jl. Pramuka No. 34, RT 02/RW 01, Kel. Sokaraja, Kec. Sokaraja, Kab. Banyumas', 'D3 Manajemen - AMD Purwokerto', 'Wirausaha', 'Pengawas', 'Terdaftar'),
('3310206512770002', '331022020038', 'Sri Rahayu', 'Jl. Cut Nyak Dien No. 67, RT 01/RW 02, Kel. Sumampir, Kec. Purwokerto Utara, Kab. Banyumas', 'S1 Hukum - UNSOED', 'Notaris', 'Koordinator Statistik Kecamatan', 'Terdaftar'),
('3310110807820001', '331022020247', 'Yuliadi', 'Jl. Kartini No. 45, RT 05/RW 03, Kel. Pwt. Wetan, Kec. Purwokerto Timur, Kab. Banyumas', 'S2 Statistika - IPB', 'Dosen', 'Koordinator Statistik Kecamatan', 'Terdaftar'),

-- Peserta 11-15: Status Lulus (untuk testing history)
('3302011506880001', '331022020101', 'Bambang Supriadi', 'Jl. Mangkubumi No. 12, RT 02/RW 04, Kel. Kebumen, Kec. Kebumen, Kab. Kebumen', 'S1 Teknik Sipil - UNS', 'Kontraktor', 'Pengawas', 'Lulus'),
('3310152808910001', '331022020156', 'Dewi Lestari', 'Jl. Jenderal Soedirman No. 99, RT 01/RW 01, Kel. Berkoh, Kec. Purwokerto Selatan, Kab. Banyumas', 'D3 Kebidanan - Poltekkes Semarang', 'Bidan', 'Petugas Pencacah', 'Lulus'),
('3310180205850001', '331022020189', 'Eko Prasetyo', 'Jl. Perintis Kemerdekaan No. 55, RT 03/RW 02, Kel. Arcawinangun, Kec. Purwokerto Timur, Kab. Banyumas', 'SMA - SMAN 3 Purwokerto', 'Pedagang', 'Petugas Pencacah', 'Lulus'),
('3302201512890001', '331022020212', 'Fitri Handayani', 'Jl. RA Kartini No. 23, RT 04/RW 01, Kel. Karangsari, Kec. Kebumen, Kab. Kebumen', 'S1 Farmasi - UGM', 'Apoteker', 'Pengawas', 'Lulus'),
('3310221008870001', '331022020234', 'Gunawan Wibisono', 'Jl. Diponegoro No. 78, RT 02/RW 03, Kel. Pwt. Lor, Kec. Purwokerto Barat, Kab. Banyumas', 'D3 Komputer - AMIK Purwokerto', 'Programmer', 'Petugas Pencacah', 'Lulus'),

-- Peserta 16-18: Status Tidak Lulus
('3310250312920001', '331022020267', 'Hendri Kurniawan', 'Jl. Panjaitan No. 34, RT 01/RW 02, Kel. Tanjung, Kec. Purwokerto Selatan, Kab. Banyumas', 'SMP', 'Buruh', 'Petugas Pencacah', 'Tidak Lulus'),
('3302281709900001', '331022020289', 'Indah Permata Sari', 'Jl. Sudirman No. 90, RT 05/RW 04, Kel. Prembun, Kec. Prembun, Kab. Kebumen', 'S1 Sastra - UNDIP', 'Penulis', 'Petugas Pencacah', 'Tidak Lulus'),
('3310301405880001', '331022020312', 'Joko Widodo', 'Jl. Merdeka No. 17, RT 02/RW 01, Kel. Kalibagor, Kec. Kalibagor, Kab. Banyumas', 'SMA - SMAN 4 Purwokerto', 'Pengangguran', 'Petugas Pencacah', 'Tidak Lulus'),

-- Peserta 19-20: Status Ditinjau
('3310332011850001', '331022020345', 'Kartika Dewi', 'Jl. Ahmad Dahlan No. 56, RT 03/RW 02, Kel. Somagede, Kec. Somagede, Kab. Banyumas', 'D3 Perpustakaan - UNDIP', 'Pustakawan', 'Petugas Pencacah', 'Ditinjau'),
('3302351803870001', '331022020378', 'Lukman Hakim', 'Jl. KH. Wahid Hasyim No. 89, RT 04/RW 03, Kel. Kutowinangun, Kec. Kutowinangun, Kab. Kebumen', 'S1 Agama - IAIN Purwokerto', 'Ustadz', 'Pengawas', 'Ditinjau');

-- ============================================
-- UPDATE NOMOR ANTREAN UNTUK YANG MENUNGGU
-- ============================================
UPDATE public.peserta SET nomor_antrean = 'A-001' WHERE nik = '3301017670101001';
UPDATE public.peserta SET nomor_antrean = 'A-002' WHERE nik = '3310105510920001';
UPDATE public.peserta SET nomor_antrean = 'A-003' WHERE nik = '3310011412950001';
UPDATE public.peserta SET nomor_antrean = 'A-004' WHERE nik = '3310081604970001';
UPDATE public.peserta SET nomor_antrean = 'A-005' WHERE nik = '3310112509930001';

-- ============================================
-- UPDATE NILAI UNTUK YANG SUDAH WAWANCARA
-- ============================================
UPDATE public.peserta SET 
    nilai_teknis = 4, 
    nilai_komunikasi = 5, 
    nilai_sikap = 4, 
    nilai_total = 87,
    durasi_wawancara = 1680
WHERE nik = '3302011506880001'; -- Bambang - Lulus

UPDATE public.peserta SET 
    nilai_teknis = 4, 
    nilai_komunikasi = 4, 
    nilai_sikap = 5, 
    nilai_total = 87,
    durasi_wawancara = 1520
WHERE nik = '3310152808910001'; -- Dewi - Lulus

UPDATE public.peserta SET 
    nilai_teknis = 3, 
    nilai_komunikasi = 4, 
    nilai_sikap = 4, 
    nilai_total = 73,
    durasi_wawancara = 1450
WHERE nik = '3310180205850001'; -- Eko - Lulus

UPDATE public.peserta SET 
    nilai_teknis = 5, 
    nilai_komunikasi = 4, 
    nilai_sikap = 5, 
    nilai_total = 93,
    durasi_wawancara = 1800
WHERE nik = '3302201512890001'; -- Fitri - Lulus

UPDATE public.peserta SET 
    nilai_teknis = 4, 
    nilai_komunikasi = 5, 
    nilai_sikap = 4, 
    nilai_total = 87,
    durasi_wawancara = 1620
WHERE nik = '3310221008870001'; -- Gunawan - Lulus

UPDATE public.peserta SET 
    nilai_teknis = 2, 
    nilai_komunikasi = 2, 
    nilai_sikap = 2, 
    nilai_total = 40,
    durasi_wawancara = 900
WHERE nik = '3310250312920001'; -- Hendri - Tidak Lulus

UPDATE public.peserta SET 
    nilai_teknis = 2, 
    nilai_komunikasi = 3, 
    nilai_sikap = 2, 
    nilai_total = 47,
    durasi_wawancara = 1100
WHERE nik = '3302281709900001'; -- Indah - Tidak Lulus

UPDATE public.peserta SET 
    nilai_teknis = 1, 
    nilai_komunikasi = 2, 
    nilai_sikap = 2, 
    nilai_total = 33,
    durasi_wawancara = 720
WHERE nik = '3310301405880001'; -- Joko - Tidak Lulus

UPDATE public.peserta SET 
    nilai_teknis = 3, 
    nilai_komunikasi = 3, 
    nilai_sikap = 3, 
    nilai_total = 60,
    durasi_wawancara = 1350
WHERE nik = '3310332011850001'; -- Kartika - Ditinjau

UPDATE public.peserta SET 
    nilai_teknis = 3, 
    nilai_komunikasi = 4, 
    nilai_sikap = 3, 
    nilai_total = 67,
    durasi_wawancara = 1400
WHERE nik = '3302351803870001'; -- Lukman - Ditinjau

-- ============================================
-- VERIFIKASI DATA
-- ============================================
SELECT 
    status,
    COUNT(*) as jumlah
FROM public.peserta
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'Menunggu' THEN 1
        WHEN 'Terdaftar' THEN 2
        WHEN 'Lulus' THEN 3
        WHEN 'Tidak Lulus' THEN 4
        WHEN 'Ditinjau' THEN 5
        ELSE 6
    END;

-- ============================================
-- SELESAI!
-- ============================================
-- Data sample berhasil dimasukkan:
-- - 5 peserta status "Menunggu" (sudah check-in, ada nomor antrean)
-- - 5 peserta status "Terdaftar" (belum check-in)
-- - 5 peserta status "Lulus" (sudah wawancara, nilai bagus)
-- - 3 peserta status "Tidak Lulus" (sudah wawancara, nilai kurang)
-- - 2 peserta status "Ditinjau" (sudah wawancara, perlu review)
-- ============================================
