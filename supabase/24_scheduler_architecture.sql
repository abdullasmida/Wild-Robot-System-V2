/*
  # SCHEDULER RE-ARCHITECTURE: THE SESSION MODEL 📅
  
  Goal: Transition from 1-to-1 'staff_shifts' to 1-to-Many 'sessions' + 'assignments'.
  This enables Multi-Staff classes and advanced Drag-and-Drop.
  
  EXECUTION ORDER:
  1. Create New Tables (Sessions, Assignments)
  2. Data Migration (Smart Grouping of existing shifts)
  3. Conflict Detection Triggers
  4. RLS Policies
*/

BEGIN;

-- =========================================================
-- 1. THE NEW SCHEMA (Sessions & Assignments)
-- =========================================================

-- A. The Parent "Card" (The Class/Session)
CREATE TABLE IF NOT EXISTS public.sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid REFERENCES public.academies(id) NOT NULL,
    location_id uuid REFERENCES public.locations(id),
    title text DEFAULT 'Training Session',
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    color text, -- Optional override, otherwise use location color
    notes text,
    capacity int, -- Optional: Max number of athletes? Or staff?
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- B. The Junction "Staff Assignment" (Who is working)
CREATE TABLE IF NOT EXISTS public.session_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    staff_id uuid REFERENCES public.profiles(id) NOT NULL,
    role text, -- e.g. 'Lead Coach', 'Assistant'. Optional.
    status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'declined')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraint: A staff members cannot be assigned to the SAME session twice
    UNIQUE(session_id, staff_id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_sessions_academy_time ON public.sessions(academy_id, start_time);
CREATE INDEX IF NOT EXISTS idx_assignments_staff ON public.session_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_assignments_session ON public.session_assignments(session_id);

-- =========================================================
-- 2. DATA MIGRATION (The Smart Transformation)
-- =========================================================

DO $$
DECLARE
    r RECORD;
    new_session_id uuid;
    loc_name text;
BEGIN
    RAISE NOTICE 'Starting Migration: staff_shifts -> sessions...';

    FOR r IN SELECT * FROM public.staff_shifts ORDER BY start_time LOOP
        
        -- 1. Check if a matching SESSION already exists (Smart Grouping)
        -- We group if: Same Academy, Same Location, Same Time
        SELECT id INTO new_session_id
        FROM public.sessions
        WHERE academy_id = r.academy_id
          AND location_id = r.location_id
          AND start_time = r.start_time
          AND end_time = r.end_time
        LIMIT 1;

        -- 2. If Session doesn't exist, Create it
        IF new_session_id IS NULL THEN
            -- Get Location Name for Title default (optional aesthetic touch)
            SELECT name INTO loc_name FROM public.locations WHERE id = r.location_id;
            
            INSERT INTO public.sessions (
                academy_id, 
                location_id, 
                start_time, 
                end_time, 
                title
            )
            VALUES (
                r.academy_id, 
                r.location_id, 
                r.start_time, 
                r.end_time, 
                COALESCE(loc_name || ' Session', 'Training Session') -- e.g. "Main Hall Session"
            )
            RETURNING id INTO new_session_id;
        END IF;

        -- 3. Create the Assignment (Link the Staff)
        INSERT INTO public.session_assignments (session_id, staff_id, status)
        VALUES (new_session_id, r.staff_id, r.status)
        ON CONFLICT (session_id, staff_id) DO NOTHING;

    END LOOP;
    
    RAISE NOTICE 'Migration Complete.';
END $$;

-- Note: We are keeping 'staff_shifts' for now as a backup. 
-- We will deprecate it later once the frontend is fully switched.


-- =========================================================
-- 3. THE SAFETY LAYER (Conflict Detection)
-- =========================================================

CREATE OR REPLACE FUNCTION public.check_staff_availability()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count int;
    new_start timestamptz;
    new_end timestamptz;
BEGIN
    -- 1. Get the time range of the NEW session we are trying to join
    SELECT start_time, end_time INTO new_start, new_end
    FROM public.sessions
    WHERE id = NEW.session_id;

    -- 2. Check for Overlap with existing assignments for this Staff
    SELECT count(*) INTO conflict_count
    FROM public.session_assignments sa
    JOIN public.sessions s ON s.id = sa.session_id
    WHERE sa.staff_id = NEW.staff_id
      AND sa.session_id != NEW.session_id -- Ignore self if updating
      AND s.start_time < new_end -- Overlap Logic
      AND s.end_time > new_start;

    -- 3. Raise Error if Conflict Found
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Conflict Detected: Staff Member is already assigned to a session during this time.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on Assignments
DROP TRIGGER IF EXISTS trigger_check_availability ON public.session_assignments;
CREATE TRIGGER trigger_check_availability
BEFORE INSERT OR UPDATE ON public.session_assignments
FOR EACH ROW
EXECUTE FUNCTION public.check_staff_availability();


-- =========================================================
-- 4. RLS POLICIES (Dual-Track)
-- =========================================================

-- A. SESSIONS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Owner: Full Access
CREATE POLICY "Command Manage Sessions" 
ON public.sessions FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.role IN ('owner', 'admin', 'manager')
        AND me.academy_id = sessions.academy_id
    )
);

-- Staff: Read Only
CREATE POLICY "Staff View Sessions" 
ON public.sessions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles me 
        WHERE me.id = auth.uid() 
        AND me.academy_id = sessions.academy_id
    )
);

-- B. ASSIGNMENTS
ALTER TABLE public.session_assignments ENABLE ROW LEVEL SECURITY;

-- Owner: Full Access
CREATE POLICY "Command Manage Assignments" 
ON public.session_assignments FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.profiles me ON me.academy_id = s.academy_id
        WHERE s.id = session_assignments.session_id
        AND me.id = auth.uid()
        AND me.role IN ('owner', 'admin', 'manager')
    )
);

-- Staff: Read Only (Can see who they are working with)
CREATE POLICY "Staff View Assignments" 
ON public.session_assignments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.profiles me ON me.academy_id = s.academy_id
        WHERE s.id = session_assignments.session_id
        AND me.id = auth.uid()
    )
);

COMMIT;
