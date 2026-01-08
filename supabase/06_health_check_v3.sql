-- 🛠️ SUPER HEALTH CHECK SQL (V3 - The Fixer)
-- This script safely updates tables even if they were created incorrectly before.

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Columns Safely (One by One)
DO $$ 
BEGIN 
    -- Fix staff_shifts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_shifts' AND column_name = 'staff_id') THEN 
        ALTER TABLE public.staff_shifts ADD COLUMN staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_shifts' AND column_name = 'academy_id') THEN 
        ALTER TABLE public.staff_shifts ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_shifts' AND column_name = 'clock_in') THEN 
        ALTER TABLE public.staff_shifts ADD COLUMN clock_in TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_shifts' AND column_name = 'clock_out') THEN 
        ALTER TABLE public.staff_shifts ADD COLUMN clock_out TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_shifts' AND column_name = 'status') THEN 
        ALTER TABLE public.staff_shifts ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Fix staff_details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_details' AND column_name = 'specialization') THEN 
        ALTER TABLE public.staff_details ADD COLUMN specialization TEXT; 
    END IF; 
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_details' AND column_name = 'availability') THEN 
        ALTER TABLE public.staff_details ADD COLUMN availability JSONB DEFAULT '{}'::jsonb; 
    END IF; 
END $$;

-- 3. Fix Policies (Now safe because columns exist)
DROP POLICY IF EXISTS "Staff can view own shifts" ON public.staff_shifts;
CREATE POLICY "Staff can view own shifts" ON public.staff_shifts FOR SELECT USING (auth.uid() = staff_id);

DROP POLICY IF EXISTS "Staff can update own details" ON public.staff_details;
CREATE POLICY "Staff can update own details" ON public.staff_details FOR UPDATE USING (auth.uid() = profile_id);

GRANT ALL ON public.staff_shifts TO authenticated;
GRANT ALL ON public.staff_details TO authenticated;
