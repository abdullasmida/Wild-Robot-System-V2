-- ================================================================
-- 31_fix_locations.sql
-- SEED DEFAULT LOCATION IF MISSING
-- ================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, name FROM public.academies LOOP
        
        -- Check if academy has ANY location
        IF NOT EXISTS (SELECT 1 FROM public.locations WHERE academy_id = r.id) THEN
            
            -- Insert Default 'Main Branch'
            INSERT INTO public.locations (academy_id, name, address, color, capacity)
            VALUES (r.id, 'Main Branch', 'Headquarters', '#10b981', 50);
            
            RAISE NOTICE 'Created default location for Academy: %', r.name;
        END IF;

    END LOOP;
END $$;
