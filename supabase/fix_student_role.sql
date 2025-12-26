-- ---------------------------------------------------------
-- FIX: ADD ROLE COLUMN AND UPDATE STUDENT
-- ---------------------------------------------------------

-- 1. Add 'role' column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN 
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'coach'; 
    END IF; 
END $$;

-- 2. Update the specific student user to 'athlete'
-- Since profiles might not have 'email', we join with auth.users
UPDATE public.profiles
SET role = 'athlete'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'student@wildrobot.com';

-- 3. Verify the role (Optional check)
-- SELECT * FROM public.profiles WHERE role = 'athlete';
