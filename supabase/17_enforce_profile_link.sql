-- 17_enforce_profile_link.sql

BEGIN;

-- 1. Ensure academy_id exists on profiles (Idempotent check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'academy_id') THEN
        ALTER TABLE public.profiles ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Add Index for Performance (Critical for RLS lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_academy_id ON public.profiles(academy_id);

COMMIT;
