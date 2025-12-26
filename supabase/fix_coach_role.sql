-- ---------------------------------------------------------
-- FIX: CORRECT COACH ROLE (ENUM HANDLING)
-- ---------------------------------------------------------

-- 1. Add 'coach' to the enum if it doesn't represent
-- We use a DO block to handle the exception if it already exists (for older PG versions)
-- Or just standard ALTER TYPE if supported.
DO $$
BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coach';
EXCEPTION
    WHEN duplicate_object THEN null; -- Ignore if exists
    WHEN OTHERS THEN null; -- Ignore other errors (like if not an enum)
END $$;

-- 2. Force update the 'coach' role
UPDATE public.profiles
SET role = 'coach'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'coach@wildrobot.com';

-- 3. Verify
-- SELECT * FROM public.profiles WHERE role = 'coach';
