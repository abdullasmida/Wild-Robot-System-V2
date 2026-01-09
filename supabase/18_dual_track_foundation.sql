/*
  # DUAL-TRACK FOUNDATION: CONCRETE REINFORCEMENT 🛠️
  
  Goal: Solidify the database schema/RLS to support the separate /command (Owner) and /staff (Coach) zones.
  
  EXECUTION ORDER:
  1. Fix Profile Columns
  2. Auto-manage Staff Details
  3. Wipe & Replace RLS for Dual-Track Security
  4. Performance Indexes
*/

BEGIN;

-- =========================================================
-- 1. SCHEMA FIXES (The "Concrete")
-- =========================================================

-- Ensure Profiles has split names and academy link
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS academy_id uuid REFERENCES public.academies(id);

-- Ensure Staff Details exists
CREATE TABLE IF NOT EXISTS public.staff_details (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) NOT NULL UNIQUE,
    academy_id uuid REFERENCES public.academies(id),
    specialization text,
    job_title text,
    availability jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =========================================================
-- 2. AUTO-CREATE STAFF DETAILS (The "Empty List" Fix)
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_staff_details_sync() 
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if the user has a staff role and belongs to an academy
    IF NEW.role IN ('coach', 'head_coach', 'manager') AND NEW.academy_id IS NOT NULL THEN
        INSERT INTO public.staff_details (profile_id, academy_id, job_title)
        VALUES (
            NEW.id, 
            NEW.academy_id, 
            INITCAP(Replace(NEW.role::text, '_', ' '))
        )
        ON CONFLICT (profile_id) 
        DO UPDATE SET academy_id = EXCLUDED.academy_id; -- Keep academy synced
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Fires on Profile Insert OR Update (e.g. when role changes)
DROP TRIGGER IF EXISTS on_staff_profile_change ON public.profiles;
CREATE TRIGGER on_staff_profile_change
AFTER INSERT OR UPDATE OF role, academy_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_staff_details_sync();

-- BACKFILL: Run the logic for existing users immediately
DO $$
BEGIN
    INSERT INTO public.staff_details (profile_id, academy_id, job_title)
    SELECT 
        id, 
        academy_id, 
        INITCAP(Replace(role::text, '_', ' '))
    FROM public.profiles
    WHERE role IN ('coach', 'head_coach', 'manager') 
    AND academy_id IS NOT NULL
    ON CONFLICT (profile_id) DO NOTHING;
END $$;

-- =========================================================
-- 3. UNIFIED "DUAL-TRACK" RLS POLICIES (Wipe & Replace)
-- =========================================================

-- A. PROFILES (The Roster)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Reset Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Academy members can view colleagues" ON public.profiles;

-- New Policy 1: Self Access (Universal)
CREATE POLICY "Universally View Own Profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

-- New Policy 2: Intra-Academy Read (The "Roster" View)
-- Drivers (Owners) and Passengers (Coaches) can see everyone in their car (Academy)
CREATE POLICY "View Academy Colleagues" 
ON public.profiles FOR SELECT 
USING (
    academy_id IN (
        SELECT academy_id FROM public.profiles WHERE id = auth.uid()
    )
);

-- New Policy 3: Command Update (Owners/Admins can edit staff in their academy)
CREATE POLICY "Command Staff Management" 
ON public.profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.role IN ('owner', 'admin', 'manager')
        AND me.academy_id = profiles.academy_id
    )
);


-- B. STAFF SHIFTS (The Schedule)
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

-- Reset Shifts Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff_shifts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.staff_shifts;
DROP POLICY IF EXISTS "Owners can manage shifts" ON public.staff_shifts;
DROP POLICY IF EXISTS "Staff can view shifts" ON public.staff_shifts;

-- New Policy 1: Command Full Access (Owner/Manager)
CREATE POLICY "Command Full Access" 
ON public.staff_shifts FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.role IN ('owner', 'admin', 'manager')
        AND me.academy_id = staff_shifts.academy_id
    )
);

-- New Policy 2: Staff Read Only (Coach/Head Coach)
CREATE POLICY "Staff Read Only" 
ON public.staff_shifts FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.academy_id = staff_shifts.academy_id
    )
);

-- Note: We generally do NOT want Coaches editing the master schedule directly, 
-- unless it's a "Swap Request" (which should be a separate table/status).
-- For now, Read-Only is safer.


-- =========================================================
-- 4. PERFORMANCE INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_profiles_academy_role ON public.profiles(academy_id, role);
CREATE INDEX IF NOT EXISTS idx_courses_academy ON public.staff_shifts(academy_id);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON public.staff_shifts(start_time);

COMMIT;
