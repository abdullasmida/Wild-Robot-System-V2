-- FIX PROFILES RLS POLICY
-- The issue is likely that "student@wildrobot.com" can login (Auth), 
-- but cannot READ their own row in 'public.profiles' to check their role.

-- 1. Enable RLS (Good practice to ensure it's on)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (clean slate for viewing)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 3. Create the permissive policy for OWN profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. Verify it worked
-- (You can run this, but in SQL Editor you are admin so it always works. 
-- The real test is the app).
