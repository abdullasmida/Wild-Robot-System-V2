-- EMERGENCY FIX FOR ACADEMY SETUP FLOW
-- Run this in the Supabase SQL Editor to unblock the "Get Started" button.

-- 1. Schema: Ensure 'type' column exists (used for Sport selection)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'type') THEN 
        ALTER TABLE public.academies ADD COLUMN type text; 
    END IF;
END $$;

-- 2. RLS: Allow ANY authenticated user to INSERT a new academy
-- (Previous policies might have required an existing academy_id, creating a deadlock)
DROP POLICY IF EXISTS "Allow authenticated users to create academies" ON public.academies;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.academies;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.academies;

CREATE POLICY "Allow authenticated users to create academies" 
ON public.academies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow owners to view their own academy" 
ON public.academies 
FOR SELECT 
TO authenticated 
USING (owner_id = auth.uid());

-- 3. RLS: Allow users to UPDATE their own profile (to save the new academy_id)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Permissions: Grant explicit access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.academies TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;

-- Confirmation
SELECT 'Use this output to confirm execution: Fix Applied Successfully' as result;
