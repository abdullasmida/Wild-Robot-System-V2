-- 🗑️ ULTIMATE CLEANUP SCRIPT (Handles Academies & Recursion)
-- Deletes all users except 'test2@wildrobot-app.com'

-- Step 1: Identify Target Users
WITH users_to_delete AS (
    SELECT id 
    FROM auth.users 
    WHERE email NOT IN ('test2@wildrobot-app.com')
)

-- Step 2: Delete Details linked to these users OR their academies
, delete_staff_recruitment AS (
    DELETE FROM public.staff_details
    WHERE profile_id IN (SELECT id FROM users_to_delete)
       OR academy_id IN (SELECT id FROM public.academies WHERE owner_id IN (SELECT id FROM users_to_delete))
)

-- Step 3: Delete Academies owned by these users (This caused the last error)
, delete_academies AS (
    DELETE FROM public.academies
    WHERE owner_id IN (SELECT id FROM users_to_delete)
)

-- Step 4: Delete Profiles
, delete_profiles AS (
    DELETE FROM public.profiles
    WHERE id IN (SELECT id FROM users_to_delete)
)

-- Step 5: Delete the Users
DELETE FROM auth.users 
WHERE id IN (SELECT id FROM auth.users WHERE email NOT IN ('test2@wildrobot-app.com'));

-- View Remaining Users
SELECT email, id FROM auth.users;
