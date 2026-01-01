-- EXPRESS SETUP FIX
-- Adds missing columns to 'academies' table to prevent setup errors.

DO $$ 
BEGIN 
    -- 1. Check and Add 'location'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'location') THEN 
        ALTER TABLE public.academies ADD COLUMN location text; 
    END IF;

    -- 2. Check and Add 'type' (for Sport Focus)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'type') THEN 
        ALTER TABLE public.academies ADD COLUMN type text; 
    END IF;

    -- 3. Check and Add 'currency' with default AED
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'currency') THEN 
        ALTER TABLE public.academies ADD COLUMN currency text DEFAULT 'AED'; 
    END IF;

END $$;

-- 4. Reload Schema Cache (notify PostgREST)
NOTIFY pgrst, 'reload config';

SELECT 'Schema Updated Successfully: location, type, and currency columns checked/added.' as result;
