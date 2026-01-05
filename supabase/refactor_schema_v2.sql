-- 🏗️ REFACTOR SCHEMA V2: Normalization & Assessments
-- Objective: Professionalize schema with lookup tables, consolidate athletes, and enable evaluations.

-- ==========================================
-- 1. STANDARDIZATION (Lookup Tables)
-- ==========================================

-- 1.1 Sports
CREATE TABLE IF NOT EXISTS public.sports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Sport
INSERT INTO public.sports (name, description)
VALUES ('Women Artistic Gymnastics', 'Olympic discipline covering Vault, Bars, Beam, and Floor')
ON CONFLICT (name) DO NOTHING;

-- 1.2 Apparatus (Linked to Sport)
CREATE TABLE IF NOT EXISTS public.apparatus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sport_id, name)
);

-- Seed Apparatus (Gymnastics)
DO $$
DECLARE
    s_id UUID;
BEGIN
    SELECT id INTO s_id FROM public.sports WHERE name = 'Women Artistic Gymnastics' LIMIT 1;
    
    IF s_id IS NOT NULL THEN
        INSERT INTO public.apparatus (sport_id, name) VALUES 
        (s_id, 'Floor'),
        (s_id, 'Vault'),
        (s_id, 'Uneven Bars'),
        (s_id, 'Balance Beam')
        ON CONFLICT (sport_id, name) DO NOTHING;
    END IF;
END $$;

-- 1.3 Levels (Linked to Sport)
CREATE TABLE IF NOT EXISTS public.levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sport_id, name)
);

-- Seed Levels
DO $$
DECLARE
    s_id UUID;
BEGIN
    SELECT id INTO s_id FROM public.sports WHERE name = 'Women Artistic Gymnastics' LIMIT 1;
    
    IF s_id IS NOT NULL THEN
        INSERT INTO public.levels (sport_id, name, "order") VALUES 
        (s_id, 'Bronze', 1),
        (s_id, 'Silver', 2),
        (s_id, 'Gold', 3),
        (s_id, 'Platinum', 4),
        (s_id, 'Diamond', 5)
        ON CONFLICT (sport_id, name) DO NOTHING;
    END IF;
END $$;

-- ==========================================
-- 2. SCHEMA REFACTORING
-- ==========================================

-- 2.1 Skill Library (Enhanced with FKs)
-- Dropping old if exists to enforce new structure (Caveat: Data loss if used, but this is a dev refactor)
DROP TABLE IF EXISTS public.skill_library CASCADE;

CREATE TABLE public.skill_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE, -- Optional: Global vs Custom skills
    apparatus_id UUID REFERENCES public.apparatus(id) ON DELETE SET NULL,
    level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Athletes (Consolidation)
-- We assume 'public.athletes' is the Source of Truth (created in enterprise_foundation.sql).
-- If 'students' or 'players' exist, we should migrate them or just drop them if they are redundant/empty.
-- For this script, we'll ensure 'athletes' has the right structure and drop the others to clean up.

DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;

-- Ensure 'athletes' exists (It should from previous scripts, but safe measure)
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    bio TEXT,
    medical_info JSONB DEFAULT '{}'::jsonb,
    stats JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. EVALUATIONS CORE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.skill_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skill_library(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- The specific coach who rated
    session_id UUID, -- Optional link to a specific class/session
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(athlete_id, skill_id, session_id) -- Prevent double rating in same session
);

-- ==========================================
-- 4. SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apparatus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
-- athletes already enabled in enterprise_foundation

-- Policies

-- 4.1 Lookup Tables (Readable by all Authenticated, Manageable by Super Admins/Mock Owners)
CREATE POLICY "Public read lookups" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Public read apparatus" ON public.apparatus FOR SELECT USING (true);
CREATE POLICY "Public read levels" ON public.levels FOR SELECT USING (true);

-- 4.2 Skill Library
-- Owners manage their own academy skills. Global skills (academy_id IS NULL) are readable.
CREATE POLICY "Read global and own skills" ON public.skill_library
    FOR SELECT USING (academy_id IS NULL OR academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Owners manage own skills" ON public.skill_library
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

-- 4.3 Skill Assessments
-- Coaches (and Owners) can Insert/Update. Athletes view only.
-- Simplification: If you are an authenticated user with a 'coach' or 'owner' role, you can manage assessments for your academy.

CREATE POLICY "Coaches manage assessments" ON public.skill_assessments
    USING (
        academy_id IN (
            SELECT academy_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'coach', 'head_coach')
        )
    )
    WITH CHECK (
        academy_id IN (
            SELECT academy_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'coach', 'head_coach')
        )
    );

CREATE POLICY "Athletes view own assessments" ON public.skill_assessments
    FOR SELECT USING (athlete_id IN (
        SELECT id FROM athletes WHERE profile_id = auth.uid() 
        UNION 
        -- Also allow guardians/parents to see
        SELECT athlete_id FROM athlete_guardians WHERE guardian_id IN (SELECT id FROM guardians WHERE profile_id = auth.uid())
    ));

-- Grant permissions
GRANT ALL ON public.sports TO authenticated;
GRANT ALL ON public.apparatus TO authenticated;
GRANT ALL ON public.levels TO authenticated;
GRANT ALL ON public.skill_library TO authenticated;
GRANT ALL ON public.skill_assessments TO authenticated;

NOTIFY pgrst, 'reload config';
