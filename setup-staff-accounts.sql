-- ============================================
-- AKUN STAFF BPS 2026 - ADMIN & PEWAWANCARA
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- SETELAH user login pertama kali via Clerk
-- ============================================

-- ============================================
-- 1. BUAT TABEL UNTUK LIMIT AKUN
-- ============================================
CREATE TABLE IF NOT EXISTS public.account_limits (
    role VARCHAR(20) PRIMARY KEY,
    max_accounts INTEGER NOT NULL,
    description TEXT
);

-- Set limit akun
INSERT INTO public.account_limits (role, max_accounts, description) VALUES
('admin', 2, 'Maksimal 2 akun admin'),
('interviewer', 10, 'Maksimal 10 akun pewawancara')
ON CONFLICT (role) DO UPDATE SET 
    max_accounts = EXCLUDED.max_accounts,
    description = EXCLUDED.description;

-- ============================================
-- 2. FUNCTION UNTUK CEK LIMIT AKUN
-- ============================================
CREATE OR REPLACE FUNCTION check_role_limit(requested_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    max_limit INTEGER;
BEGIN
    -- Peserta tidak ada limit
    IF requested_role = 'candidate' THEN
        RETURN jsonb_build_object('allowed', true, 'message', 'OK');
    END IF;
    
    -- Cek limit untuk admin dan interviewer
    SELECT max_accounts INTO max_limit 
    FROM public.account_limits 
    WHERE role = requested_role;
    
    IF max_limit IS NULL THEN
        RETURN jsonb_build_object('allowed', false, 'message', 'Role tidak valid');
    END IF;
    
    -- Hitung akun yang sudah ada
    SELECT COUNT(*) INTO current_count 
    FROM public.profiles 
    WHERE role = requested_role;
    
    IF current_count >= max_limit THEN
        RETURN jsonb_build_object(
            'allowed', false, 
            'message', 'Kuota ' || requested_role || ' sudah penuh (' || max_limit || ' akun)',
            'current', current_count,
            'max', max_limit
        );
    ELSE
        RETURN jsonb_build_object(
            'allowed', true, 
            'message', 'OK',
            'current', current_count,
            'max', max_limit,
            'remaining', max_limit - current_count
        );
    END IF;
END;
$$;

-- ============================================
-- 3. PRE-REGISTER AKUN ADMIN (2 SLOT)
-- ============================================
-- Admin 1: admin@bps.go.id
-- Admin 2: admin2@bps.go.id
-- 
-- CATATAN: Akun ini akan dibuat otomatis saat
-- user dengan email tersebut login via Clerk
-- dan memilih role "admin"
-- ============================================

-- ============================================
-- 4. VIEW UNTUK MONITORING AKUN
-- ============================================
CREATE OR REPLACE VIEW public.staff_accounts AS
SELECT 
    role,
    COUNT(*) as current_count,
    (SELECT max_accounts FROM public.account_limits WHERE account_limits.role = profiles.role) as max_accounts
FROM public.profiles
WHERE role IN ('admin', 'interviewer')
GROUP BY role;

-- ============================================
-- 5. CONTOH CARA MEMBUAT AKUN ADMIN LANGSUNG
-- ============================================
-- Jika ingin membuat akun admin langsung di database
-- (user harus sudah login via Clerk terlebih dahulu):
--
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@bps.go.id';
--
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin2@bps.go.id';
-- ============================================

-- ============================================
-- VERIFIKASI
-- ============================================
SELECT * FROM public.account_limits;
SELECT check_role_limit('admin');
SELECT check_role_limit('interviewer');

-- ============================================
-- SELESAI!
-- ============================================
-- Limit akun sudah diset:
-- - Admin: maks 2 akun
-- - Pewawancara: maks 10 akun
-- - Peserta: tidak ada limit (login via NIK)
-- ============================================
