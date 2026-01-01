-- 1. Ensure 'type' column exists (and 'sport' just in case, or we stick to 'type')
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'type') THEN 
        ALTER TABLE public.academies ADD COLUMN type text; 
    END IF;
END $$;

-- 2. Drop existing INSERT policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to create academies" ON public.academies;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.academies;

-- 3. Create a permissive INSERT policy for authenticated users
-- This is necessary because a new owner doesn't have an academy_id yet, 
-- so they can't match against an existing row.
CREATE POLICY "Allow authenticated users to create academies" 
ON public.academies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Ensure Owners can UPDATE their own profile to link the academy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Grant permissions just in case
GRANT INSERT ON public.academies TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
