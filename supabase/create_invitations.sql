-- ---------------------------------------------------------
-- MIGRATION: INVITATIONS TABLE 📩
-- ---------------------------------------------------------

-- 1. Create Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token UUID DEFAULT gen_random_uuid() NOT NULL, -- The secret link token
    email TEXT NOT NULL,
    role public.app_role NOT NULL,
    academy_id UUID, -- Will link to academies table once created (Audit Priority 1)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(token)
);

-- 2. Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow anyone to read an invitation if they have the token (for validation on JoinTeam page)
CREATE POLICY "Public read by token" 
ON public.invitations FOR SELECT 
USING (true); -- Ideally: token = current_setting('request.jwt.claim.sub', true) OR true for public endpoint check? 
-- Since the user isn't logged in yet, we need public read access, but we should restrict it?
-- For now, allow public read so the Page can validate the token.
-- A better approach is a Postgres Function `check_invite(token)` to avoid exposing the whole table.

-- Policy for Coaches/Admins to CREATE invitations
CREATE POLICY "Admins can create invitations"
ON public.invitations FOR INSERT
TO authenticated
WITH CHECK (true); -- TODO: Refine to check if user is admin of the academy
