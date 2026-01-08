-- 🟢 FORCE VERIFY "ahmed" (Try Again)
-- Now that we see him in the dashboard, this WILL work.

-- 1. Force Update
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'ahmed@wildrobot-app.com';

-- 2. Check Result (Should show the date now)
SELECT email, email_confirmed_at, last_sign_in_at
FROM auth.users
WHERE email = 'ahmed@wildrobot-app.com';
