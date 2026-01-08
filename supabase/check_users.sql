-- 🕵️‍♂️ CHECK ALL USERS
-- Run this to see who is actually in the database and their status

SELECT 
    email, 
    id, 
    created_at, 
    email_confirmed_at,
    role
FROM auth.users
ORDER BY created_at DESC;
