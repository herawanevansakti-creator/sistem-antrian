-- ============================================
-- FIX RLS POLICY FOR CLERK INTEGRATION
-- ============================================
-- Karena menggunakan Clerk (bukan Supabase Auth),
-- auth.uid() tidak akan cocok dengan Clerk User ID.
-- 
-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR
-- untuk memperbaiki policy update profiles
-- ============================================

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new policy that allows all updates
-- (Since auth is handled by Clerk, we can't use auth.uid())
-- Option 1: Allow all updates (for development)
CREATE POLICY "Anyone can update profiles" 
ON public.profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

-- ============================================
-- ALTERNATIF: Gunakan Service Role Key
-- ============================================
-- Jika Anda ingin lebih aman, gunakan service role key
-- di server-side (API route) untuk update profile.
-- 
-- Atau buat custom policy berdasarkan JWT claim dari Clerk:
-- 
-- CREATE POLICY "Clerk users can update own profile" 
-- ON public.profiles FOR UPDATE 
-- USING (
--   id = current_setting('request.jwt.claims', true)::json->>'sub'
-- );
-- 
-- Ini memerlukan konfigurasi JWT di Supabase.
-- ============================================
