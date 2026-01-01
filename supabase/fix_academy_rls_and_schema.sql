-- EMERGENCY FIX: Academy Setup Permissions & Schema
-- 1. Ensure 'type' column exists (legacy fallback)
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'General';

-- 2. Ensure RLS enabled (security best practice)
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;

-- 3. NUCLEAR OPTION: Drop existing Academy policies to prevent conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.academies;
DROP POLICY IF EXISTS "Owners can update their own academy" ON public.academies;
DROP POLICY IF EXISTS "Everyone can read academies" ON public.academies;

-- 4. Create PERMISSIVE Policy for first-time creation
-- This allows ANY authenticated user to insert a row (Start of setup)
CREATE POLICY "Allow authenticated users to create academy"
ON public.academies FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

-- 5. Standard policies for later
CREATE POLICY "Owners can update their own academy"
ON public.academies FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Everyone can read academies"
ON public.academies FOR SELECT
USING (true);

-- 6. Ensure Profiles are updateable
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 7. Grant permissions explicitly (just in case)
GRANT ALL ON public.academies TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE academies_id_seq TO authenticated;
