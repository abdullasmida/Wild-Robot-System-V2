/*
  # FIX MISSING COLUMNS & RELATIONSHIPS (ROBUST) 🛡️
  
  Goal: 
  1. Ensure the columns (lead_coach_id, location_id, coach_id) actually exist. 
     (If the table existed before, 'CREATE TABLE IF NOT EXISTS' ignores new columns).
  2. Add the Foreign Key constraints to fix the 400 Bad Request error.
*/

-- 1. ADD COLUMNS IF MISSING
DO $$ 
BEGIN
    -- Batches: lead_coach_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'lead_coach_id') THEN
        ALTER TABLE public.batches ADD COLUMN lead_coach_id uuid;
    END IF;

    -- Batches: location_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'location_id') THEN
        ALTER TABLE public.batches ADD COLUMN location_id uuid;
    END IF;

    -- Sessions: coach_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_sessions' AND column_name = 'coach_id') THEN
        ALTER TABLE public.class_sessions ADD COLUMN coach_id uuid;
    END IF;
END $$;


-- 2. ADD CONSTRAINTS
BEGIN;

    -- Connect Batches -> Locations
    ALTER TABLE public.batches 
        DROP CONSTRAINT IF EXISTS batches_location_id_fkey;
    
    ALTER TABLE public.batches
        ADD CONSTRAINT batches_location_id_fkey 
        FOREIGN KEY (location_id) 
        REFERENCES public.locations(id);

    -- Connect Batches -> Lead Coach (Profile)
    ALTER TABLE public.batches 
        DROP CONSTRAINT IF EXISTS batches_lead_coach_id_fkey;

    ALTER TABLE public.batches
        ADD CONSTRAINT batches_lead_coach_id_fkey 
        FOREIGN KEY (lead_coach_id) 
        REFERENCES public.profiles(id);

    -- Connect Sessions -> Coach (Profile)
    ALTER TABLE public.class_sessions 
        DROP CONSTRAINT IF EXISTS class_sessions_coach_id_fkey;

    ALTER TABLE public.class_sessions
        ADD CONSTRAINT class_sessions_coach_id_fkey 
        FOREIGN KEY (coach_id) 
        REFERENCES public.profiles(id);

COMMIT;
