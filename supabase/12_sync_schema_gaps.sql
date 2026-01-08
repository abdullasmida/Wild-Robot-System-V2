-- 12_sync_schema_gaps.sql
-- Master Script to synchronize DB Schema with Frontend Expectations (Gap Analysis)

-- ==========================================
-- 1. NOTIFICATIONS TABLE (Missing)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'shift_assigned', 'time_off_approved', etc.
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_link TEXT, -- Optional URL to redirect to
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

GRANT ALL ON public.notifications TO authenticated;


-- ==========================================
-- 2. LOCATIONS TABLE (Missing academy_id)
-- ==========================================
-- Gap: Frontend filters locations by academy_id, but DB lacked this column.

DO $$ 
BEGIN
    -- Add academy_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'academy_id') THEN
        ALTER TABLE public.locations ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
    END IF;

    -- Add capacity if not exists (Mock data uses it)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'capacity') THEN
        ALTER TABLE public.locations ADD COLUMN capacity INTEGER DEFAULT 20;
    END IF;
END $$;

-- Policy Update for Locations
DROP POLICY IF EXISTS "Owners manage academy locations" ON public.locations;
CREATE POLICY "Owners manage academy locations" ON public.locations
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

-- Allow read access for authenticated users (Staff need to see locations)
DROP POLICY IF EXISTS "Authenticated read locations" ON public.locations;
CREATE POLICY "Authenticated read locations" ON public.locations
    FOR SELECT TO authenticated USING (true);


-- ==========================================
-- 3. ATHLETES TABLE (Missing academy_id Check)
-- ==========================================
-- Ensure academy_id exists on athletes (Likely does, but enforcing for safety)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'academy_id') THEN
        ALTER TABLE public.athletes ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
    END IF;
END $$;


-- ==========================================
-- 4. STAFF SHIFTS (Explicit FK for Joins)
-- ==========================================
-- Ensure we can join 'staff_shifts.staff_id' -> 'profiles.id' cleanly.
-- The FK exists, but ensuring the constraint name is known helps with PostgREST resource embedding.

-- No action needed if references is already set, Supabase handles implicit joins well if ambiguous.
-- However, we will verify the explicit constraint in `useScheduleData.ts` query logic later.

-- ==========================================
-- 5. REFRESH SCHEMA CACHE
-- ==========================================
NOTIFY pgrst, 'reload config';
