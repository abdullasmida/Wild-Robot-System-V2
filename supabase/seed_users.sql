-- ---------------------------------------------------------
-- MISSION: LINK AUTH USERS TO PROFILES
-- ---------------------------------------------------------

-- 1. Insert Coach into `public.profiles`
-- We use ON CONFLICT to avoid errors if they already exist.
-- Adjust 'full_name' and 'email' if you have specific values.
INSERT INTO public.profiles (id, email, full_name, coach_type)
VALUES (
    '0036e85b-c82b-4f12-b43f-2a2d49dd4ffa', -- Coach UID
    'coach@wildrobot.com',                  -- Placeholder Email
    'Coach One',                            -- Placeholder Name
    'coach'                                 -- Role
)
ON CONFLICT (id) DO UPDATE 
SET coach_type = 'coach', full_name = 'Coach One';


-- 2. Insert Student into `public.students`
-- This assumes a `students` table exists as per frontend code.
INSERT INTO public.students (id, full_name, level, avatar_url)
VALUES (
    '3555c4b2-f51b-4e88-9522-3455deeac3d0', -- Student UID
    'Hero Student',                         -- Placeholder Name
    'Gold',                                 -- Placeholder Level
    '/wibo_assets/Gamification/wibo_skill_master_hero.png' -- Default Avatar
)
ON CONFLICT (id) DO UPDATE
SET full_name = 'Hero Student';

-- 3. (Optional) Ensure Student has a Profile entry if your app requires it for login
-- Some apps use a central `profiles` table for ALL users + `students` for details.
-- Uncomment below if you experience login issues for the student.

-- INSERT INTO public.profiles (id, email, full_name, coach_type)
-- VALUES (
--     '3555c4b2-f51b-4e88-9522-3455deeac3d0',
--     'student@wildrobot.com',
--     'Hero Student',
--     'student'
-- )
-- ON CONFLICT (id) DO NOTHING;
