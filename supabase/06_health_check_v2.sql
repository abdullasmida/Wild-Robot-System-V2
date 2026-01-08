-- 🛠️ SUPER HEALTH CHECK - THE FIX IS HERE
-- I have updated this file to ONLY fix the columns first.
-- This prevents the "column does not exist" error.

-- 1. Create table if missing
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Safely Add Columns using separate blocks
DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN clock_in TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN clock_out TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN status TEXT DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_details ADD COLUMN specialization TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_details ADD COLUMN availability JSONB DEFAULT '{}'::jsonb;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3. Success Message
SELECT '✅ STEP 1 COMPLETE: Schema is fixed. Now run step 2 policies.' as result;
