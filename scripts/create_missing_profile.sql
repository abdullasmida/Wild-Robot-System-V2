-- FIX MISSING PROFILE
-- The previous update returned "No rows", meaning this user exists in Auth but NOT in the database tables.

-- 1. Insert the missing profile by copying data from Auth System
INSERT INTO public.profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    id, 
    email, 
    'athlete',             -- Force role to athlete
    'Student User',        -- Default name
    created_at, 
    now()
FROM auth.users
WHERE email = 'student@wildrobot.com'
ON CONFLICT (id) DO UPDATE -- In case it exists but was hidden (just update role)
SET role = 'athlete';

-- 2. Verify Result
SELECT * FROM public.profiles WHERE email = 'student@wildrobot.com';
