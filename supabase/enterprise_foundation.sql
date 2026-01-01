-- 🏗️ ENTERPRISE FOUNDATION SCRIPT
-- Objective: Create the data layer for Staff Management and Athlete Gamification.

-- ==========================================
-- 1. STAFF OPERATIONAL TABLES
-- ==========================================

-- 1.1 Staff Details (Extended Profile)
CREATE TABLE IF NOT EXISTS public.staff_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    job_title TEXT,
    salary_config JSONB DEFAULT '{}'::jsonb, -- e.g. { "rate": 5000, "type": "monthly" }
    custom_fields JSONB DEFAULT '{}'::jsonb, -- Dynamic fields like "T-Shirt Size"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- 1.2 Staff Shifts (Time Tracking)
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ DEFAULT NOW(),
    clock_out TIMESTAMPTZ,
    status TEXT DEFAULT 'active', -- 'active', 'completed'
    gps_check_in JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Staff Tasks (To-Do List)
CREATE TABLE IF NOT EXISTS public.staff_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'done', 'archived'
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. THE HERO SYSTEM (Athletes & Guardians)
-- ==========================================

-- 2.1 Guardians (The Family Wallet)
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Can exist without App Login initially
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    relationship_type TEXT DEFAULT 'parent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Athletes (The Heroes)
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Optional (for older athletes)
    name TEXT NOT NULL,
    dob DATE,
    gender TEXT, -- 'male', 'female'
    bio TEXT,
    medical_info JSONB DEFAULT '{}'::jsonb, -- e.g. { "allergies": ["nuts"], "blood_type": "O+" }
    stats JSONB DEFAULT '{"pace": 60, "shooting": 60, "passing": 60, "dribbling": 60, "defense": 60, "physical": 60}'::jsonb, -- FIFA Stats
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'injured'
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Athlete <-> Guardian (Many-to-Many Junction)
CREATE TABLE IF NOT EXISTS public.athlete_guardians (
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    PRIMARY KEY (athlete_id, guardian_id)
);

-- ==========================================
-- 3. SECURITY (RLS Policies)
-- ==========================================

-- Enable RLS
ALTER TABLE public.staff_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_guardians ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user owns the academy related to the record
-- Note: Optimizing strictly for Owner CRUD right now.
-- In production, we'd add 'Manager' role checks here too.

-- 3.1 Staff Details Policies
CREATE POLICY "Owners can manage staff details" ON public.staff_details
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Staff can view own details" ON public.staff_details
    FOR SELECT USING (profile_id = auth.uid());

-- 3.2 Staff Shifts Policies
CREATE POLICY "Owners manage shifts" ON public.staff_shifts
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Staff manage own shifts" ON public.staff_shifts
    USING (staff_id = auth.uid())
    WITH CHECK (staff_id = auth.uid());

-- 3.3 Staff Tasks Policies
CREATE POLICY "Owners manage tasks" ON public.staff_tasks
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Staff view assigned tasks" ON public.staff_tasks
    FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Staff update assigned task status" ON public.staff_tasks
    FOR UPDATE USING (assigned_to = auth.uid());

-- 3.4 Athletes & Guardians Policies (Owner Only for Phase 3)
CREATE POLICY "Owners manage athletes" ON public.athletes
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Owners manage guardians" ON public.guardians
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Owners manage athlete links" ON public.athlete_guardians
    USING (athlete_id IN (SELECT id FROM athletes WHERE academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid())))
    WITH CHECK (athlete_id IN (SELECT id FROM athletes WHERE academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid())));

-- ==========================================
-- 4. GRANT PERMISSIONS
-- ==========================================
GRANT ALL ON public.staff_details TO authenticated;
GRANT ALL ON public.staff_shifts TO authenticated;
GRANT ALL ON public.staff_tasks TO authenticated;
GRANT ALL ON public.guardians TO authenticated;
GRANT ALL ON public.athletes TO authenticated;
GRANT ALL ON public.athlete_guardians TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
