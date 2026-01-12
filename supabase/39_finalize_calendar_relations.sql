/*
  # FINAL RELATIONSHIP REPAIR 🔗
  
  Goal: Fix the persisting 400 Bad Request by re-creating ALL Foreign Keys.
  It seems the base tables (batches, class_sessions) might have existed without links to 'programs' or 'batches' initially.
  
  WE WILL RE-ASSERT ALL 5 LINKS:
  1. Batches -> Programs (program_id)
  2. Batches -> Locations (location_id)
  3. Batches -> Profiles (lead_coach_id)
  4. Sessions -> Batches (batch_id)
  5. Sessions -> Profiles (coach_id)
*/

BEGIN;

-- 1. Programs -> Batches
ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_program_id_fkey;
ALTER TABLE public.batches 
    ADD CONSTRAINT batches_program_id_fkey 
    FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;

-- 2. Batches -> Locations
ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_location_id_fkey;
ALTER TABLE public.batches 
    ADD CONSTRAINT batches_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES public.locations(id);

-- 3. Batches -> Profiles (Lead Coach)
ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_lead_coach_id_fkey;
ALTER TABLE public.batches 
    ADD CONSTRAINT batches_lead_coach_id_fkey 
    FOREIGN KEY (lead_coach_id) REFERENCES public.profiles(id);

-- 4. Sessions -> Batches
ALTER TABLE public.class_sessions DROP CONSTRAINT IF EXISTS class_sessions_batch_id_fkey;
ALTER TABLE public.class_sessions 
    ADD CONSTRAINT class_sessions_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

-- 5. Sessions -> Profiles (Coach)
ALTER TABLE public.class_sessions DROP CONSTRAINT IF EXISTS class_sessions_coach_id_fkey;
ALTER TABLE public.class_sessions 
    ADD CONSTRAINT class_sessions_coach_id_fkey 
    FOREIGN KEY (coach_id) REFERENCES public.profiles(id);

-- Trigger Schema Cache Reload (Supabase specific trick)
NOTIFY pgrst, 'reload schema';

COMMIT;
