-- 🛠️ SUPER HEALTH CHECK - STEP 1: FIX SCHEMA
-- Run this FIRST. It ensures the tables have the right columns.

-- 1. Create staff_shifts if it doesn't exist
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add 'staff_id'
DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. Add 'academy_id'
DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 4. Add 'clock_in'
DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN clock_in TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 5. Add 'clock_out'
DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN clock_out TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 6. Add 'status'
DO $$ BEGIN
    ALTER TABLE public.staff_shifts ADD COLUMN status TEXT DEFAULT 'active';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 7. Add 'specialization' to staff_details
DO $$ BEGIN
    ALTER TABLE public.staff_details ADD COLUMN specialization TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL; -- Ignore if exists
END $$;

-- 8. Add 'availability' to staff_details
DO $$ BEGIN
    ALTER TABLE public.staff_details ADD COLUMN availability JSONB DEFAULT '{}'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;
