/*
  # ACADEMIC CALENDAR: REPAIR & STABILIZE 🛠️
  
  Goal: Fix 500/404 errors by simplifying RLS and ensuring all tables exist correctly.
  
  Changes:
  1. Re-assert table existence (programs, batches, class_sessions).
  2. WIPE and REPLACE RLS policies with simplified non-recursive logic.
  3. ensure 'parent_id' and 'hourly_rate' columns exist.
*/

BEGIN;

-- =========================================================
-- 1. SCHEMA VERIFICATION
-- =========================================================

-- Ensure Programs
CREATE TABLE IF NOT EXISTS public.programs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid NOT NULL, -- references academies technically, but we won't force FK to avoid strict order issues in this repair script if academies table is locked/busy, standard FK is fine though. 
    name text NOT NULL,
    color text DEFAULT '#3b82f6',
    age_group text,
    description text,
    tags text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Ensure Batches
CREATE TABLE IF NOT EXISTS public.batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    academy_id uuid NOT NULL,
    location_id uuid,
    lead_coach_id uuid,
    
    name text NOT NULL,
    schedule_rules jsonb DEFAULT '{}'::jsonb,
    
    capacity int DEFAULT 10,
    min_capacity_for_profit int DEFAULT 4,
    price decimal(10,2) DEFAULT 0.00,
    status text DEFAULT 'active',
    start_date date,
    end_date date,
    created_at timestamptz DEFAULT now()
);

-- Ensure Sessions
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id uuid REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    academy_id uuid NOT NULL,
    
    date date NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    
    coach_id uuid,
    status text DEFAULT 'scheduled',
    topic text,
    created_at timestamptz DEFAULT now()
);

-- Fix Missing Columns safely
DO $$ 
BEGIN
    -- Programs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'tags') THEN
        ALTER TABLE public.programs ADD COLUMN tags text[] DEFAULT '{}';
    END IF;

     -- Staff Details (Profitability)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_details' AND column_name = 'hourly_rate') THEN
        ALTER TABLE public.staff_details ADD COLUMN hourly_rate decimal(10,2) DEFAULT 0.00;
    END IF;

    -- Profiles (Family Sync)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'parent_id') THEN
        ALTER TABLE public.profiles ADD COLUMN parent_id uuid REFERENCES public.profiles(id);
    END IF;
END $$;


-- =========================================================
-- 2. RLS REPAIR (The Core Fix)
-- =========================================================

-- Enable RLS
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

-- DROP ALL EXISTING POLICIES TO BE SAFE
DROP POLICY IF EXISTS "Academy View Programs" ON public.programs;
DROP POLICY IF EXISTS "Owner Manage Programs" ON public.programs;
DROP POLICY IF EXISTS "Owners manage all calendar" ON public.programs;
DROP POLICY IF EXISTS "Staff view programs" ON public.programs;

DROP POLICY IF EXISTS "Academy View Batches" ON public.batches;
DROP POLICY IF EXISTS "Owner Manage Batches" ON public.batches;
DROP POLICY IF EXISTS "Owners manage batches" ON public.batches;
DROP POLICY IF EXISTS "Staff view batches" ON public.batches;

DROP POLICY IF EXISTS "Academy View Class Sessions" ON public.class_sessions;
DROP POLICY IF EXISTS "Owner Manage Class Sessions" ON public.class_sessions;
DROP POLICY IF EXISTS "Owners manage sessions" ON public.class_sessions;
DROP POLICY IF EXISTS "Staff view sessions" ON public.class_sessions;

-- NEW SIMPLIFIED POLICIES
-- Strategy: Use a direct lookup. If the user is in the same academy, they can view.
-- If user is owner/admin/manager of that academy, they can manage.

-- PROGRAMS
CREATE POLICY "Calendar_View_Programs" ON public.programs FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Calendar_Manage_Programs" ON public.programs FOR ALL USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
);

-- BATCHES
CREATE POLICY "Calendar_View_Batches" ON public.batches FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Calendar_Manage_Batches" ON public.batches FOR ALL USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
);

-- SESSIONS
CREATE POLICY "Calendar_View_Sessions" ON public.class_sessions FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Calendar_Manage_Sessions" ON public.class_sessions FOR ALL USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
);

COMMIT;
