-- 🛠️ FINAL FIX: SCHEMA ONLY
-- Please Run THIS script and NOT the others.

-- 1. Create table if it is missing
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Force Add Columns (One by One)
DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN status TEXT DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN clock_in TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_details ADD COLUMN availability JSONB DEFAULT '{}'::jsonb;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.staff_details ADD COLUMN specialization TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3. Confirmation
SELECT '✅ Schema Fixed! Now you can run the Policies script.' as result;
