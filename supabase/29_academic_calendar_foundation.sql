/*
  # ACADEMIC CALENDAR: FOUNDATION 📅
  
  Goal: Create the "Product Side" of the scheduler (Classes, Programs, Batches).
  
  Tables:
  1. public.programs (The "What")
  2. public.batches (The "When" - Recurring Definition)
  3. public.class_sessions (The "Now" - Actual Instances)
  4. public.enrollments (The "Who")
  
  Security:
  - Strict RLS based on Academy ownership.
*/

BEGIN;

-- =========================================================
-- 1. PROGRAMS (The "Product" / Category)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.programs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#3b82f6', -- Blue default
    age_group text, -- e.g. "5-8 Years"
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy View Programs" ON public.programs FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Owner Manage Programs" ON public.programs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.role IN ('owner', 'admin', 'manager')
        AND me.academy_id = programs.academy_id
    )
);


-- =========================================================
-- 2. BATCHES (The "Recurring Group")
-- =========================================================
CREATE TABLE IF NOT EXISTS public.batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) NOT NULL,
    program_id uuid REFERENCES public.programs(id) NOT NULL,
    location_id uuid REFERENCES public.locations(id),
    lead_coach_id uuid REFERENCES public.profiles(id), -- Default coach
    
    name text NOT NULL, -- e.g. "Team Alpha - 5PM"
    schedule_rules jsonb DEFAULT '{}', -- e.g. { "days": [1,3], "time": "17:00" }
    capacity int DEFAULT 20,
    price numeric(10,2) DEFAULT 0,
    
    status text DEFAULT 'active', -- active, archived
    start_date date,
    end_date date,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy View Batches" ON public.batches FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Owner Manage Batches" ON public.batches FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.role IN ('owner', 'admin', 'manager')
        AND me.academy_id = batches.academy_id
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_batches_program ON public.batches(program_id);
CREATE INDEX IF NOT EXISTS idx_batches_lead ON public.batches(lead_coach_id);


-- =========================================================
-- 3. CLASS SESSIONS (The "Daily Instance")
-- =========================================================
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) NOT NULL,
    batch_id uuid REFERENCES public.batches(id) NOT NULL,
    
    date date NOT NULL,
    start_time timestamptz NOT NULL, -- Full timestamp for precision
    end_time timestamptz NOT NULL,
    
    coach_id uuid REFERENCES public.profiles(id), -- Explicit override or copy from batch
    status text DEFAULT 'scheduled', -- scheduled, cancelled, completed
    room text, -- specific room detail if needed
    
    created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy View Class Sessions" ON public.class_sessions FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Owner Manage Class Sessions" ON public.class_sessions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.role IN ('owner', 'admin', 'manager')
        AND me.academy_id = class_sessions.academy_id
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch ON public.class_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_range ON public.class_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_class_sessions_coach ON public.class_sessions(coach_id);


-- =========================================================
-- 4. ENROLLMENTS (Students in Batches)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) NOT NULL,
    batch_id uuid REFERENCES public.batches(id) NOT NULL,
    athlete_id uuid REFERENCES public.profiles(id) NOT NULL,
    
    status text DEFAULT 'active', -- active, hold, dropped, trial
    start_date date DEFAULT CURRENT_DATE,
    end_date date,
    
    notes text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(batch_id, athlete_id) -- Prevent double enrollment
);

-- RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy View Enrollments" ON public.enrollments FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Owner Manage Enrollments" ON public.enrollments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.role IN ('owner', 'admin', 'manager')
        AND me.academy_id = enrollments.academy_id
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_athlete ON public.enrollments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch ON public.enrollments(batch_id);

COMMIT;
