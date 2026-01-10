-- 28_fix_recursion_securely.sql

BEGIN;

-- 1. Create a secure helper function to get the current user's academy ID
-- This bypasses RLS permissions (SECURITY DEFINER) to avoid the infinite loop.
CREATE OR REPLACE FUNCTION public.get_my_academy_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT academy_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Drop the problematic recursive policies to be safe
DROP POLICY IF EXISTS "Staff can view colleagues" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view academy profiles" ON public.profiles; -- Cleanup duplicate naming if any

-- 3. Re-create the policy using the secure function
-- This allows you to see anyone who shares your academy_id, without triggering a loop.
CREATE POLICY "Staff can view colleagues"
ON public.profiles FOR SELECT TO authenticated
USING (
  academy_id = get_my_academy_id()
);

-- 4. Ensure Self-View exists (Good practice)
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
CREATE POLICY "Users can see own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

COMMIT;
