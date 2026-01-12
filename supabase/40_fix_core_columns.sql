/*
  # FIX CORE COLUMNS (CRITICAL) 🚨
  
  Goal: Fix the "column program_id does not exist" error.
  The 'batches' table is missing 'program_id', and likely 'class_sessions' is missing 'batch_id'.
  This script adds them if they are missing.
*/

-- 1. FORCE ADD MISSING CORE COLUMNS
DO $$ 
BEGIN
    -- Fix Batches: program_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'program_id') THEN
        ALTER TABLE public.batches ADD COLUMN program_id uuid;
    END IF;

    -- Fix Sessions: batch_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_sessions' AND column_name = 'batch_id') THEN
        ALTER TABLE public.class_sessions ADD COLUMN batch_id uuid;
    END IF;
END $$;


-- 2. NOW ADD THE CONSTRAINTS (Safe to run now)
BEGIN;

    -- Batches -> Programs
    ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_program_id_fkey;
    ALTER TABLE public.batches 
        ADD CONSTRAINT batches_program_id_fkey 
        FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;

    -- Sessions -> Batches
    ALTER TABLE public.class_sessions DROP CONSTRAINT IF EXISTS class_sessions_batch_id_fkey;
    ALTER TABLE public.class_sessions 
        ADD CONSTRAINT class_sessions_batch_id_fkey 
        FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

    -- Force Refresh
    NOTIFY pgrst, 'reload schema';

COMMIT;
