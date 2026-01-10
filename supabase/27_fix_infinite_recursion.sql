-- 27_fix_infinite_recursion.sql

BEGIN;

-- 1. Ensure "Users can see own profile" exists (Base Case for Recursion)
-- This allows the subquery `SELECT academy_id FROM profiles WHERE id = auth.uid()` to succeed without triggering complex logic.
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
CREATE POLICY "Users can see own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 2. Refine "Staff can view colleagues" to be safer
-- We keep the logic but the existence of the above policy breaks the infinite recursion loop for the subquery.
-- However, we can also optimize the subquery to fetch academy_id directly if we wanted, but the "Self" policy is the standard fix.

COMMIT;
