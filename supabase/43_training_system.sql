-- 43_training_system.sql
-- ARCHITECTURE: High-Performance Training System (The "Brain")
-- CONTEXT: Manages Curriculums, Skills, Drills, and Workout Plans.
-- STRATEGY: "YouTube Embeds + WebP" for media optimization.

-- ==============================================================================
-- 1. CURRICULUMS (Versioning Container)
-- ==============================================================================
-- Problem: Skills change every few years (USAG 2021 vs 2029).
-- Solution: Snapshot versions so old assessments don't break.

CREATE TABLE IF NOT EXISTS public.curriculums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,         -- e.g. "USAG Women's Artistic"
    version TEXT NOT NULL,      -- e.g. "2024-2025"
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Curriculums
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage academy curriculums" ON public.curriculums
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Coaches view academy curriculums" ON public.curriculums
    FOR SELECT
    USING (academy_id IN (
        SELECT academy_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('owner', 'coach', 'head_coach')
    ));

-- ==============================================================================
-- 2. SKILLS (Core Data)
-- ==============================================================================
-- Requirement: Media Optimization (video_provider_id + preview_url).
-- Migration: Rename 'skill_library' to 'skills' if it exists to match new naming convention.

DO $$ 
BEGIN
    -- Only rename if 'skill_library' exists AND 'skills' does NOT exist
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'skill_library') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'skills') THEN
        ALTER TABLE public.skill_library RENAME TO skills;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE SET NULL, -- Link to version
    apparatus_id UUID REFERENCES public.apparatus(id) ON DELETE SET NULL,
    level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Media Optimization (No Blobs)
    video_provider_id TEXT,       -- e.g. "dQw4w9WgXcQ" (YouTube ID)
    video_platform TEXT DEFAULT 'youtube', -- 'youtube', 'vimeo', 'custom'
    preview_url TEXT,             -- Lightweight WebP for lists
    
    -- Legacy support (if migrated from skill_library)
    video_url TEXT, 
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist (if table already existed)
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE SET NULL;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS apparatus_id UUID REFERENCES public.apparatus(id) ON DELETE SET NULL;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS video_provider_id TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS video_platform TEXT DEFAULT 'youtube';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- RLS: Skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Re-apply policies to ensure they cover the new table name/structure
DROP POLICY IF EXISTS "Owners manage own skills" ON public.skills;
CREATE POLICY "Owners manage own skills" ON public.skills
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Coaches and athletes view skills" ON public.skills;
CREATE POLICY "Coaches and athletes view skills" ON public.skills
    FOR SELECT
    USING (
        -- Global skills (null academy) OR Skills in user's academy
        academy_id IS NULL OR 
        academy_id IN (
            SELECT academy_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ==============================================================================
-- 3. DRILLS (Training Library)
-- ==============================================================================
-- Difference from Skills: Drills are exercises/homework.

CREATE TABLE IF NOT EXISTS public.drills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    -- Media Optimization
    video_provider_id TEXT,
    video_platform TEXT DEFAULT 'youtube',
    preview_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOIN TABLE: Drill <-> Skills (Many-to-Many)
-- "This drill helps improve these skills"
CREATE TABLE IF NOT EXISTS public.drill_skills (
    drill_id UUID REFERENCES public.drills(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (drill_id, skill_id)
);

-- RLS: Drills
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage drills" ON public.drills
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Coaches view drills" ON public.drills
    FOR SELECT
    USING (academy_id IN (
        SELECT academy_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('owner', 'coach', 'head_coach')
    ));

-- ==============================================================================
-- 4. WORKOUT PLANS (Digital Lesson Plans)
-- ==============================================================================
-- Replaces Paper Clipboards.

CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Coach who made it
    assigned_level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL, -- "Level 3 Plan"
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- If true, other coaches in academy can see/copy
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items within the plan (Ordered List)
CREATE TABLE IF NOT EXISTS public.workout_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    
    -- An item is EITHER a Drill OR a Skill (or just a text note)
    drill_id UUID REFERENCES public.drills(id) ON DELETE SET NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    
    sort_order INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER, -- "Spend 10 mins on this"
    notes TEXT,               -- "Watch for bent knees"
    
    CHECK (drill_id IS NOT NULL OR skill_id IS NOT NULL OR notes IS NOT NULL)
);

-- RLS: Workout Plans
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_items ENABLE ROW LEVEL SECURITY;

-- Owners: Full Control
CREATE POLICY "Owners manage plans" ON public.workout_plans
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

-- Coaches: Manage their OWN plans, View Public plans in their academy
CREATE POLICY "Coaches manage own plans" ON public.workout_plans
    USING (
        auth.uid() = author_id OR
        (is_public = true AND academy_id IN (
            SELECT academy_id FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'head_coach')
        ))
    )
    WITH CHECK (
        auth.uid() = author_id 
        AND academy_id IN (SELECT academy_id FROM profiles WHERE id = auth.uid())
    );

-- Items policies inherit from plan access effectively
CREATE POLICY "Access items via plan" ON public.workout_items
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_items.plan_id
            AND (
                wp.author_id = auth.uid() 
                OR wp.academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid())
                OR (wp.is_public = true AND wp.academy_id IN (SELECT academy_id FROM profiles WHERE id = auth.uid()))
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_items.plan_id
            AND (wp.author_id = auth.uid() OR wp.academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
        )
    );

-- ==============================================================================
-- 5. PERMISSIONS
-- ==============================================================================

GRANT ALL ON public.curriculums TO authenticated;
GRANT ALL ON public.skills TO authenticated;
GRANT ALL ON public.drills TO authenticated;
GRANT ALL ON public.drill_skills TO authenticated;
GRANT ALL ON public.workout_plans TO authenticated;
GRANT ALL ON public.workout_items TO authenticated;

NOTIFY pgrst, 'reload config';
