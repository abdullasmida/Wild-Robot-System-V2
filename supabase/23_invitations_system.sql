/*
  # DUAL-TRACK BRIDGE: INVITATIONS SYSTEM 🌉
  
  Goal: Create a robust "Memory" of invitations so new staff are automatically 
  linked to the correct Academy upon signup.
  
  EXECUTION ORDER:
  1. Create Invitations Table
  2. RLS Policies (Owner Control)
  3. Auto-Link Trigger (The "Handshake")
  4. Manual Repair for Test14/Smida14
*/

BEGIN;

-- =========================================================
-- 1. THE INVITATIONS LEDGER
-- =========================================================

CREATE TABLE IF NOT EXISTS public.invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) NOT NULL,
    email text NOT NULL,
    role app_role NOT NULL, -- 'coach', 'head_coach', 'manager'
    token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'), -- Secure random token
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup during signup
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);

-- =========================================================
-- 2. SECURITY (RLS)
-- =========================================================

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Owners/Admins can VIEW invitations for THEIR academy
CREATE POLICY "Command View Invites" 
ON public.invitations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.academy_id = invitations.academy_id
        AND me.role IN ('owner', 'admin', 'manager')
    )
);

-- Policy: Owners/Admins can CREATE invitations for THEIR academy
CREATE POLICY "Command Create Invites" 
ON public.invitations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.academy_id = invitations.academy_id
        AND me.role IN ('owner', 'admin', 'manager')
    )
);

-- Policy: Owners can DELETE/CANCEL invites
CREATE POLICY "Command Delete Invites" 
ON public.invitations FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.academy_id = invitations.academy_id
        AND me.role IN ('owner', 'admin', 'manager')
    )
);

-- =========================================================
-- 3. THE HANDSHAKE (Auto-Link Trigger)
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_invite() 
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
BEGIN
    -- 1. Check if there is a PENDING invitation for this email
    SELECT * INTO invite_record 
    FROM public.invitations 
    WHERE email = NEW.email 
    AND status = 'pending'
    LIMIT 1;

    -- 2. If Invitation Found -> Link them!
    IF FOUND THEN
        -- A. Update the Profile (created by the other trigger, or we update NEW meta)
        -- We wait for the profile to be created? Or we update it after?
        -- Best practice: Update the profile ROW directly.
        
        -- Wait... 'on_auth_user_created' usually runs first and creates the profile.
        -- We should run this AFTER profile creation.
        -- OR we can simply update the profile table directly.
        
        UPDATE public.profiles
        SET 
            academy_id = invite_record.academy_id,
            role = invite_record.role
        WHERE id = NEW.id;

        -- B. Mark Invitation as Accepted
        UPDATE public.invitations 
        SET status = 'accepted', updated_at = now()
        WHERE id = invite_record.id;
        
        -- C. Ensure Staff Details (The dual-track safeguard)
        INSERT INTO public.staff_details (profile_id, academy_id, job_title)
        VALUES (
            NEW.id,
            invite_record.academy_id,
            INITCAP(Replace(invite_record.role::text, '_', ' '))
        )
        ON CONFLICT (profile_id) DO UPDATE
        SET academy_id = EXCLUDED.academy_id; -- Heal connection
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run AFTER Insert on auth.users (so profile *should* theoretically exist or we race it)
-- To be safe, let's run it simply on auth.users.
-- Note: 'profiles' creation usually happens on an auth trigger too.
-- If we run this as 'AFTER INSERT ON auth.users', it might race with the 'create_profile_for_user' trigger.
-- FIX: We will update public.profiles directly. If the profile trigger hasn't run yet, this update might fail or do nothing?
-- Actually, best approach is to have ONE master trigger. 
-- BUT, for stability, let's do this: 
-- We will creates a trigger on PROFILES table instead. 
-- "When a profile is created, check for invites."

DROP TRIGGER IF EXISTS on_profile_created_check_invite ON public.profiles;

CREATE OR REPLACE FUNCTION public.check_invite_on_profile_creation()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    user_email text;
BEGIN
    -- Get email from auth.users because profiles might not have it reliable yet? 
    -- Actually profiles usually has email.
    -- Let's query auth.users just to be 100% sure we match the login email.
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

    SELECT * INTO invite_record 
    FROM public.invitations 
    WHERE email = user_email
    AND status = 'pending'
    LIMIT 1;

    IF FOUND THEN
        -- Link the profile
        NEW.academy_id := invite_record.academy_id;
        NEW.role := invite_record.role;
        
        -- Update the invitation status
        UPDATE public.invitations 
        SET status = 'accepted', updated_at = now()
        WHERE id = invite_record.id;
        
        -- We don't need to insert staff_details here because the 
        -- 'handle_staff_details_sync' trigger will catch the update to NEW.role/academy_id!
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_check_invite
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_invite_on_profile_creation();


-- =========================================================
-- 4. EMERGENCY MANUAL BRIDGE (Fix Test14 -> Smida14)
-- =========================================================
DO $$
DECLARE
    academy_id_val uuid;
    owner_id_val uuid;
    coach_id_val uuid;
BEGIN
    -- 1. Find the Academy ID of 'test14@wildrobot-app.com'
    SELECT p.academy_id, p.id INTO academy_id_val, owner_id_val
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE u.email = 'test14@wildrobot-app.com'
    LIMIT 1;

    -- 2. Find the Profile ID of 'smida14@wildrobot-app.com' (The Orphan)
    SELECT p.id INTO coach_id_val
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE u.email = 'smida14@wildrobot-app.com' OR u.email = 'smida14@wildrobot-app.com' -- Handle potential casing
    LIMIT 1;

    -- 3. Perform the Surgery
    IF academy_id_val IS NOT NULL AND coach_id_val IS NOT NULL THEN
        
        -- A. Link Profile
        UPDATE public.profiles
        SET 
            academy_id = academy_id_val,
            role = 'coach' -- Ensure they are a coach
        WHERE id = coach_id_val;

        -- B. Create/Link Staff Details
        INSERT INTO public.staff_details (profile_id, academy_id, job_title, specialization)
        VALUES (
            coach_id_val,
            academy_id_val,
            'Coach',
            'Gymnastics'
        )
        ON CONFLICT (profile_id) 
        DO UPDATE SET academy_id = EXCLUDED.academy_id;

        RAISE NOTICE 'SUCCESS: Linked smida14 to Academy %', academy_id_val;
    ELSE
        RAISE NOTICE 'WARNING: Could not find User or Academy to link. Skipping manual fix.';
    END IF;
END $$;

COMMIT;
