-- 🔐 MAGIC FIX: FORCE PASSWORD & CONFIRM
-- This will manually set the password to '123456' and confirm the email.

-- 1. Enable pgcrypto extension to generate password hashes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Force Update User (Password + Confirmation)
UPDATE auth.users
SET 
    encrypted_password = crypt('123456', gen_salt('bf')), -- Sets password to 123456
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'abdulla@wildrobot-app.com';

-- 3. Verify Result
SELECT email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email = 'abdulla@wildrobot-app.com';
