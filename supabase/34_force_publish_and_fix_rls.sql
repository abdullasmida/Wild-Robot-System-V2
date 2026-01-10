-- ================================================================
-- 34_force_publish_and_fix_rls.sql
-- (CORRECTED SYNTAX)
-- 1. FORCE PUBLISH ALL SHIFTS
-- 2. FIX RLS RECURSION ON SESSIONS
-- ================================================================

DO $$
BEGIN

    -- 1. FORCE PUBLISH (Just in case the button wasn't clicked)
    UPDATE public.sessions
    SET is_published = true
    WHERE is_published = false;

    RAISE NOTICE 'All shifts have been published.';


    -- 2. FIX RLS ON SESSIONS (Prevent Infinite Recursion)
    -- We use the secure function get_my_academy_id() instead of querying profiles table.

    -- Enable RLS just in case
    ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

    -- Drop old policy if exists
    DROP POLICY IF EXISTS "Staff View Sessions" ON public.sessions;

    -- Create new safe policy
    CREATE POLICY "Staff View Sessions" 
    ON public.sessions FOR SELECT 
    USING (
        academy_id = (SELECT public.get_my_academy_id())
    );


    -- 3. FIX RLS ON ASSIGNMENTS

    -- Enable RLS just in case
    ALTER TABLE public.session_assignments ENABLE ROW LEVEL SECURITY;

    -- Drop old policy if exists
    DROP POLICY IF EXISTS "Staff View Assignments" ON public.session_assignments;

    -- Create new safe policy
    CREATE POLICY "Staff View Assignments" 
    ON public.session_assignments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions s
            WHERE s.id = session_assignments.session_id
            AND s.academy_id = (SELECT public.get_my_academy_id())
        )
    );

    RAISE NOTICE 'RLS Policies updated securely.';

END $$;
