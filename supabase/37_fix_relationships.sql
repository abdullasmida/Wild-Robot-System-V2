/*
  # FIX MISSING RELATIONSHIPS 🔗
  
  ERROR: 400 Bad Request
  CAUSE: The tables 'batches' and 'class_sessions' have columns (location_id, coach_id) 
         that are missing explicit FOREIGN KEY references. 
         Supabase requires these to perform joins like `batch:batches(...)` or `coach:profiles(...)`.
*/

BEGIN;

-- 1. Fix Batches: Allow joining with 'locations'
ALTER TABLE public.batches 
    DROP CONSTRAINT IF EXISTS batches_location_id_fkey;

ALTER TABLE public.batches
    ADD CONSTRAINT batches_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES public.locations(id);

-- 2. Fix Batches: Allow joining with 'profiles' (Lead Coach)
ALTER TABLE public.batches 
    DROP CONSTRAINT IF EXISTS batches_lead_coach_id_fkey;

ALTER TABLE public.batches
    ADD CONSTRAINT batches_lead_coach_id_fkey 
    FOREIGN KEY (lead_coach_id) 
    REFERENCES public.profiles(id);

-- 3. Fix Sessions: Allow joining with 'profiles' (Coach)
ALTER TABLE public.class_sessions 
    DROP CONSTRAINT IF EXISTS class_sessions_coach_id_fkey;

ALTER TABLE public.class_sessions
    ADD CONSTRAINT class_sessions_coach_id_fkey 
    FOREIGN KEY (coach_id) 
    REFERENCES public.profiles(id);

COMMIT;
