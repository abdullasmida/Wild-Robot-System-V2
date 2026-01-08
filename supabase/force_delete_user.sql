-- 🚨 FORCE DELETE STUCK USER (Cascade)
-- This script manually deletes linked data first to bypass the "Database Error"

-- 1. Delete from 'staff_details' (Child of Profile)
DELETE FROM public.staff_details
WHERE profile_id IN (
    SELECT id FROM auth.users WHERE email IN ('abdullasmida@wildrobot-app.com', 'abdullasmida@wildrobot.com')
);

-- 2. Delete from 'profiles' (Child of User)
DELETE FROM public.profiles
WHERE id IN (
    SELECT id FROM auth.users WHERE email IN ('abdullasmida@wildrobot-app.com', 'abdullasmida@wildrobot.com')
);

-- 3. Finally, Delete the User from Auth
DELETE FROM auth.users
WHERE email IN ('abdullasmida@wildrobot-app.com', 'abdullasmida@wildrobot.com');

SELECT 'Users and all related data deleted successfully' as result;
