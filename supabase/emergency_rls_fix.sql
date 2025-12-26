-- EMERGENCY RLS FIX script
-- DIAGNOSIS: The current RLS policies on 'profiles' are causing an infinite recursion loop.
-- FIX: Wipe all policies and implement a simplified, non-recursive "Blind Read" policy.

BEGIN;

-- 1. Disable RLS temporarily to allow admin operations without blocking
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. NUCLEAR OPTION: Drop ALL existing policies on profiles to ensure a clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
-- (Attempt to drop *any* other potential policy names found in common templates)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- 3. IMPLEMENT "BLIND READ" POLICY
-- This policy allows ANY authenticated user to SELECT ANY row in profiles.
-- CRITICAL: It uses (true) to avoid querying the table itself, preventing recursion.
CREATE POLICY "blind_read_all_profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 4. SECURE UPDATE POLICY
-- Users can only update their OWN profile.
CREATE POLICY "update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 5. INSERT POLICY
-- Users can insert their own profile (standard for checks during sign-up).
CREATE POLICY "insert_own_profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 6. RE-ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. UPSERT COACH PROFILE (FAILSAFE)
-- Ensure the coach account exists and has super_admin privileges.
-- We use ON CONFLICT to update the role if the user already exists.
-- NOTE: We are assuming the coach ID is known or we rely on email lookup which is harder in pure SQL if auth.users is restricted.
-- HOWEVER, we can update based on the specific UUID if known, OR we can try to insert into public.profiles if we know the ID.
-- Since we might not have the exact UUID handy in this script context without querying auth.users (which might be restricted),
-- we will focus on the RLS fix which allows the "Profile Not Found" error to resolve naturally if the record exists.
-- BUT, if you need to force a role for a specific email, you can try this (requires permissions to read auth.users usually):

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Attempt to find the specific coach user by email in auth.users
  -- NOTE: This often requires postgres superuser execution context in Supabase SQL Editor
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'coach@wildrobot.com';

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (v_user_id, 'coach@wildrobot.com', 'super_admin', 'Head Coach')
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin';
  END IF;
END $$;

COMMIT;

-- VERIFICATION QUERY
SELECT * FROM public.profiles LIMIT 5;
