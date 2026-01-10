-- 26_fix_coach_access.sql

BEGIN;

-- 1. FIX IDENTITY: Allow Staff to read Academy Name
DROP POLICY IF EXISTS "Authenticated users can view academies" ON public.academies;
CREATE POLICY "Authenticated users can view academies" 
ON public.academies FOR SELECT TO authenticated USING (true);

-- 2. FIX SCHEDULER CRASH: Allow Staff to read Locations (Fixes 400 Error)
DROP POLICY IF EXISTS "Staff can view academy locations" ON public.locations;
CREATE POLICY "Staff can view academy locations" 
ON public.locations FOR SELECT TO authenticated 
USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);

-- 3. ENABLE "CREW" VIEW: Allow Staff to see other Staff (Avatars)
DROP POLICY IF EXISTS "Staff can view colleagues" ON public.profiles;
CREATE POLICY "Staff can view colleagues" 
ON public.profiles FOR SELECT TO authenticated 
USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);

-- 4. SCHEMA UPGRADE: Add Connecteam-Style Columns
DO $$ 
BEGIN 
    -- Job Type for color coding (e.g. 'Coaching', 'Meeting')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'job_type') THEN
        ALTER TABLE public.sessions ADD COLUMN job_type text DEFAULT 'Coaching';
    END IF;
    
    -- Open Shifts Logic
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'is_open_for_claim') THEN
        ALTER TABLE public.sessions ADD COLUMN is_open_for_claim boolean DEFAULT false;
    END IF;
    
    -- Capacity Logic
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'capacity') THEN
        ALTER TABLE public.sessions ADD COLUMN capacity int DEFAULT 1;
    END IF;
END $$;

COMMIT;
