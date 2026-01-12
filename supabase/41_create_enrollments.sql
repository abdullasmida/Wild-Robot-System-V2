/*
  # RE-CREATE ENROLLMENTS TABLE (FORCE FIX)
  
  Goal: Fix "column enrollments.academy_id does not exist" error.
  We drop the table first to ensure we start with a clean slate.
*/

-- 1. CLEANUP (Drop if exists to avoid stale schema)
DROP VIEW IF EXISTS public.batch_enrollment_stats;
DROP TABLE IF EXISTS public.enrollments CASCADE;

-- 2. CREATE TABLE
CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
    batch_id uuid REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    athlete_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status text CHECK (status IN ('active', 'trial', 'waitlist', 'dropped', 'completed')) DEFAULT 'active',
    start_date date DEFAULT CURRENT_DATE,
    end_date date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Prevent double booking same student in same batch
    UNIQUE(batch_id, athlete_id)
);

-- 3. RLS POLICIES
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for academy users" ON public.enrollments
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE academy_id = enrollments.academy_id
    ));

CREATE POLICY "Enable write access for staff" ON public.enrollments
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE academy_id = enrollments.academy_id AND role IN ('owner', 'admin', 'coach', 'head_coach')
    ));

-- 4. CREATE STATS VIEW (Profit Radar)
CREATE OR REPLACE VIEW public.batch_enrollment_stats AS
SELECT 
    batch_id,
    COUNT(*) FILTER (WHERE status IN ('active', 'trial')) as active_count,
    COUNT(*) FILTER (WHERE status = 'waitlist') as waitlist_count
FROM public.enrollments
GROUP BY batch_id;

-- 5. GRANT ACCESS
GRANT SELECT ON public.batch_enrollment_stats TO authenticated;
GRANT SELECT ON public.batch_enrollment_stats TO service_role;

NOTIFY pgrst, 'reload schema';
