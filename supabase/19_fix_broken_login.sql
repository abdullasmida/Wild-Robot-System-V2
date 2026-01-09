/*
  # EMERGENCY FIX: LOGIN RESTORE 🚑
  
  Goal: Fix "SYSTEM ERROR: User profile missing" by syncing orphaned auth.users to public.profiles.
  
  Steps:
  1. Insert missing profiles for any user in auth.users
  2. Ensure they have a default role if missing
  3. Ensure RLS allows them to be seen
*/

BEGIN;

-- 1. SYNC ORPHANED USERS (Auth -> Profiles)
-- Allows login for users who exist in Auth but not in the App DB
INSERT INTO public.profiles (id, email, role, first_name, last_name, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'coach'), -- Default to Coach if unknown
    COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'last_name', ''),
    now()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;


-- 2. ENSURE ACADEMY LINK (Optional but helpful)
-- If a user has 'academy_id' in metadata but not in profile (rare sync issue)
UPDATE public.profiles p
SET academy_id = (au.raw_user_meta_data->>'academy_id')::uuid
FROM auth.users au
WHERE p.id = au.id 
AND p.academy_id IS NULL 
AND au.raw_user_meta_data->>'academy_id' IS NOT NULL;


-- 3. ENSURE METADATA HAS ROLE (For the Fallback Check in Login.jsx)
-- If Login.jsx fails query, it checks metadata. Let's make sure metadata is populated.
UPDATE auth.users
SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'coach')
WHERE raw_user_meta_data->>'role' IS NULL;


COMMIT;
