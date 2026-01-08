-- ☢️ NUCLEAR OPTION: CONFIRM EVERYONE ☢️
-- This will verify ALL users in the database so you don't have to worry about names.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Show me everyone afterward
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;
