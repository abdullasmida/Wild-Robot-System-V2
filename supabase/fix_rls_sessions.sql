-- ---------------------------------------------------------
-- FIX: ACTIVE SESSIONS RLS POLICIES
-- ---------------------------------------------------------
-- The "System Error" occurred because the user (Authenticated) 
-- did not have permission to DELETE or INSERT into 'active_sessions'.

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_agent TEXT,
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- 3. DROP Existing Policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.active_sessions;

-- 4. CREATE Correct Policies
-- Allow SELECT
CREATE POLICY "Users can view their own sessions"
ON public.active_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Allow INSERT
CREATE POLICY "Users can insert their own sessions"
ON public.active_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow DELETE (Crucial for the "Simulated Logout" / Wipe)
CREATE POLICY "Users can delete their own sessions"
ON public.active_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Allow UPDATE
CREATE POLICY "Users can update their own sessions"
ON public.active_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Add Profile Column for Device Limit (Ensure it exists)
-- This prevents the "Profile Not Found" retry loop if the column is missing.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_allowed_devices INT DEFAULT 1;
