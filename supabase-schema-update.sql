-- ============================================
-- RECRUITFLOW PRO - SCHEMA UPDATE
-- ============================================
-- Jalankan script ini di SQL Editor Supabase
-- Dashboard > SQL Editor > New Query
-- ============================================
-- CATATAN: Jalankan setelah supabase-setup.sql
-- ============================================

-- ============================================
-- 1. UPDATE TABEL APPLICATIONS
-- Menambahkan kolom untuk Geofencing & Duration
-- ============================================

-- Tambah kolom geolocation untuk verifikasi check-in
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

-- Tambah kolom duration untuk mencatat durasi interview (dalam detik)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;

-- Tambah kolom score_summary langsung di applications (untuk backward compatibility)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS score_summary JSONB;

-- Tambah kolom checked_in_date untuk indexing (tanpa timezone issue)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS checked_in_date DATE;

-- Comment untuk dokumentasi struktur score_summary
COMMENT ON COLUMN public.applications.score_summary IS 
'JSON structure: {"technical": 1-5, "communication": 1-5, "attitude": 1-5, "notes": "string"}';

-- ============================================
-- 2. UPDATE TABEL JOBS
-- Menambahkan deskripsi dan kolom tambahan
-- ============================================

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS max_candidates INTEGER DEFAULT 50;

-- ============================================
-- 3. UPDATE TABEL PROFILES
-- Menambahkan kolom untuk avatar dan phone
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- 4. TRIGGER UNTUK AUTO-SET checked_in_date
-- ============================================

CREATE OR REPLACE FUNCTION set_checked_in_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.checked_in_at IS NOT NULL THEN
        NEW.checked_in_date := NEW.checked_in_at::date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_checked_in_date ON public.applications;
CREATE TRIGGER trigger_set_checked_in_date
    BEFORE INSERT OR UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION set_checked_in_date();

-- Update existing rows to set checked_in_date
UPDATE public.applications 
SET checked_in_date = checked_in_at::date 
WHERE checked_in_at IS NOT NULL AND checked_in_date IS NULL;

-- ============================================
-- 5. BUAT VIEW UNTUK ANALYTICS
-- View untuk statistik per posisi
-- ============================================

CREATE OR REPLACE VIEW public.job_analytics AS
SELECT 
    j.id AS job_id,
    j.title AS job_title,
    COUNT(a.id) AS total_applicants,
    COUNT(CASE WHEN a.status = 'waiting' THEN 1 END) AS waiting_count,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_count,
    COALESCE(AVG(a.duration), 0) AS avg_duration_seconds,
    COALESCE(
        AVG(
            (COALESCE((a.score_summary->>'technical')::numeric, 0) +
             COALESCE((a.score_summary->>'communication')::numeric, 0) +
             COALESCE((a.score_summary->>'attitude')::numeric, 0)) / 3.0
        ), 0
    ) AS avg_score
FROM public.jobs j
LEFT JOIN public.applications a ON j.id = a.job_id
GROUP BY j.id, j.title;

-- ============================================
-- 6. VIEW UNTUK QUEUE STATUS
-- View untuk menampilkan antrean aktif
-- ============================================

CREATE OR REPLACE VIEW public.active_queue AS
SELECT 
    a.id,
    a.queue_number,
    a.status,
    a.checked_in_at,
    a.duration,
    a.location_verified,
    a.score_summary,
    p.full_name AS candidate_name,
    p.email AS candidate_email,
    j.title AS job_title,
    j.id AS job_id
FROM public.applications a
JOIN public.profiles p ON a.candidate_id = p.id
JOIN public.jobs j ON a.job_id = j.id
WHERE a.status IN ('waiting', 'assigned', 'interviewing')
ORDER BY a.checked_in_at ASC;

-- ============================================
-- 7. VIEW UNTUK COMPLETED INTERVIEWS
-- View untuk riwayat interview yang sudah selesai
-- ============================================

CREATE OR REPLACE VIEW public.completed_interviews AS
SELECT 
    a.id,
    a.queue_number,
    a.checked_in_at,
    a.duration,
    a.score_summary,
    p.full_name AS candidate_name,
    j.title AS job_title,
    COALESCE((a.score_summary->>'technical')::numeric, 0) AS score_technical,
    COALESCE((a.score_summary->>'communication')::numeric, 0) AS score_communication,
    COALESCE((a.score_summary->>'attitude')::numeric, 0) AS score_attitude,
    a.score_summary->>'notes' AS reviewer_notes
FROM public.applications a
JOIN public.profiles p ON a.candidate_id = p.id
JOIN public.jobs j ON a.job_id = j.id
WHERE a.status = 'completed'
ORDER BY a.checked_in_at DESC;

-- ============================================
-- 8. FUNGSI UNTUK COMPLETE SESSION
-- Update session dengan score
-- ============================================

CREATE OR REPLACE FUNCTION complete_interview_session(
    p_application_id BIGINT,
    p_interviewer_id TEXT,
    p_duration INTEGER,
    p_score_technical INTEGER,
    p_score_communication INTEGER,
    p_score_attitude INTEGER,
    p_notes TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_score_summary JSONB;
BEGIN
    -- Build score summary JSON
    v_score_summary := jsonb_build_object(
        'technical', p_score_technical,
        'communication', p_score_communication,
        'attitude', p_score_attitude,
        'notes', p_notes
    );

    -- Update application dengan status completed dan scores
    UPDATE public.applications 
    SET 
        status = 'completed',
        duration = p_duration,
        score_summary = v_score_summary
    WHERE id = p_application_id;

    -- Update session jika ada
    UPDATE public.sessions 
    SET 
        ended_at = NOW(),
        score_summary = v_score_summary
    WHERE application_id = p_application_id 
    AND interviewer_id = p_interviewer_id;

    -- Update interviewer status ke idle
    UPDATE public.profiles 
    SET interviewer_status = 'idle' 
    WHERE id = p_interviewer_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'Interview session completed successfully',
        'application_id', p_application_id
    );
END;
$$;

-- ============================================
-- 9. FUNGSI UNTUK CHECK-IN DENGAN GEOLOCATION
-- ============================================

CREATE OR REPLACE FUNCTION checkin_with_location(
    p_candidate_id TEXT,
    p_job_id BIGINT,
    p_latitude DECIMAL,
    p_longitude DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_queue_number VARCHAR(10);
    v_application_id BIGINT;
    v_today_count INTEGER;
BEGIN
    -- Generate queue number (format: Q-XXX)
    SELECT COUNT(*) + 1 INTO v_today_count
    FROM public.applications
    WHERE checked_in_date = CURRENT_DATE;
    
    v_queue_number := 'Q-' || LPAD(v_today_count::TEXT, 3, '0');

    -- Insert new application
    INSERT INTO public.applications (
        candidate_id,
        job_id,
        queue_number,
        status,
        checked_in_at,
        checked_in_date,
        location_lat,
        location_lng,
        location_verified
    ) VALUES (
        p_candidate_id,
        p_job_id,
        v_queue_number,
        'waiting',
        NOW(),
        CURRENT_DATE,
        p_latitude,
        p_longitude,
        TRUE
    )
    RETURNING id INTO v_application_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'application_id', v_application_id,
        'queue_number', v_queue_number,
        'message', 'Check-in berhasil!'
    );
END;
$$;

-- ============================================
-- 10. FUNGSI UNTUK MENDAPATKAN STATISTIK HARI INI
-- ============================================

CREATE OR REPLACE FUNCTION get_today_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_today INTEGER;
    v_completed_today INTEGER;
    v_waiting_now INTEGER;
    v_avg_duration INTEGER;
    v_avg_score DECIMAL;
BEGIN
    -- Total aplikasi hari ini
    SELECT COUNT(*) INTO v_total_today
    FROM public.applications
    WHERE checked_in_date = CURRENT_DATE;

    -- Completed hari ini
    SELECT COUNT(*) INTO v_completed_today
    FROM public.applications
    WHERE checked_in_date = CURRENT_DATE
    AND status = 'completed';

    -- Waiting sekarang
    SELECT COUNT(*) INTO v_waiting_now
    FROM public.applications
    WHERE status = 'waiting';

    -- Rata-rata durasi (completed hari ini)
    SELECT COALESCE(AVG(duration), 0) INTO v_avg_duration
    FROM public.applications
    WHERE checked_in_date = CURRENT_DATE
    AND status = 'completed';

    -- Rata-rata score (completed hari ini)
    SELECT COALESCE(AVG(
        (COALESCE((score_summary->>'technical')::numeric, 0) +
         COALESCE((score_summary->>'communication')::numeric, 0) +
         COALESCE((score_summary->>'attitude')::numeric, 0)) / 3.0
    ), 0) INTO v_avg_score
    FROM public.applications
    WHERE checked_in_date = CURRENT_DATE
    AND status = 'completed';

    RETURN jsonb_build_object(
        'total_today', v_total_today,
        'completed_today', v_completed_today,
        'waiting_now', v_waiting_now,
        'avg_duration_seconds', v_avg_duration,
        'avg_score', ROUND(v_avg_score, 1)
    );
END;
$$;

-- ============================================
-- 11. INDEX UNTUK PERFORMA
-- Menggunakan kolom DATE langsung, bukan fungsi
-- ============================================

CREATE INDEX IF NOT EXISTS idx_applications_checked_in_date 
ON public.applications(checked_in_date);

CREATE INDEX IF NOT EXISTS idx_applications_status_date 
ON public.applications(status, checked_in_date);

CREATE INDEX IF NOT EXISTS idx_applications_job_status 
ON public.applications(job_id, status);

-- ============================================
-- 12. UPDATE SAMPLE DATA JOBS
-- ============================================

-- Update existing jobs dengan description
UPDATE public.jobs SET description = 'Pengembangan antarmuka pengguna dengan React/Vue' WHERE title = 'Frontend Developer';
UPDATE public.jobs SET description = 'Pengembangan server-side dengan Node.js/Python' WHERE title = 'Backend Developer';
UPDATE public.jobs SET description = 'Desain pengalaman pengguna dan antarmuka' WHERE title = 'UI/UX Designer';
UPDATE public.jobs SET description = 'Analisis data dan business intelligence' WHERE title = 'Data Analyst';
UPDATE public.jobs SET description = 'Infrastruktur dan deployment automation' WHERE title = 'DevOps Engineer';

-- ============================================
-- SELESAI SCHEMA UPDATE!
-- ============================================
-- Perubahan yang diterapkan:
-- ✅ Kolom geolocation di applications
-- ✅ Kolom duration untuk interview
-- ✅ Kolom checked_in_date (untuk indexing)
-- ✅ Trigger auto-set checked_in_date
-- ✅ Score summary dengan struktur standar
-- ✅ View untuk analytics
-- ✅ View untuk active queue
-- ✅ View untuk completed interviews
-- ✅ Function complete_interview_session
-- ✅ Function checkin_with_location
-- ✅ Function get_today_stats
-- ✅ Index menggunakan kolom DATE langsung
-- ============================================
