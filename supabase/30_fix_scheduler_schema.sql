-- ================================================================
-- 30_fix_scheduler_schema.sql
-- FIX MISSING RELATIONS & TABLES FOR SCHEDULER V2
-- ================================================================

BEGIN;

-- 1. Ensure 'locations' table exists (It should, but just in case)
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) NOT NULL,
    name text NOT NULL,
    address text,
    color text DEFAULT '#10b981',
    capacity int DEFAULT 20,
    created_at timestamptz DEFAULT now()
);

-- 2. Fix 'sessions' table columns
-- We need 'location_id' to point to 'locations'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'location_id') THEN
        ALTER TABLE public.sessions ADD COLUMN location_id uuid REFERENCES public.locations(id);
    END IF;
END $$;

-- 3. Data Migration: If 'branch' text exists, try to fill 'location_id'
-- This handles the case where 'reset_sessions_table.sql' was used
UPDATE public.sessions 
SET location_id = (
    SELECT id FROM public.locations 
    WHERE public.locations.name = public.sessions.branch 
    AND public.locations.academy_id = public.sessions.academy_id
    LIMIT 1
)
WHERE location_id IS NULL 
AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'branch');

-- 4. Ensure 'session_assignments' table exists
-- This is critical for the new drag-and-drop assign logic
CREATE TABLE IF NOT EXISTS public.session_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    staff_id uuid REFERENCES public.profiles(id) NOT NULL,
    role text DEFAULT 'Coach',
    status text DEFAULT 'confirmed',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(session_id, staff_id)
);

-- 5. Enable RLS on Assignments if new
ALTER TABLE public.session_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Owners Manage
DROP POLICY IF EXISTS "Command Manage Assignments" ON public.session_assignments;
CREATE POLICY "Command Manage Assignments" ON public.session_assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.profiles me ON me.academy_id = s.academy_id
        WHERE s.id = session_assignments.session_id
        AND me.id = auth.uid()
        AND me.role IN ('owner', 'admin', 'manager')
    )
);

-- Policy: Staff View
DROP POLICY IF EXISTS "Staff View Assignments" ON public.session_assignments;
CREATE POLICY "Staff View Assignments" ON public.session_assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.profiles me ON me.academy_id = s.academy_id
        WHERE s.id = session_assignments.session_id
        AND me.id = auth.uid()
    )
);

-- 6. Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_sessions_location ON public.sessions(location_id);
CREATE INDEX IF NOT EXISTS idx_assignments_session ON public.session_assignments(session_id);

COMMIT;
