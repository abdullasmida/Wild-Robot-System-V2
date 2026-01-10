-- ================================================================
-- 33_add_branches.sql
-- ADD SHARJAH, AJMAN, DUBAI LOCATIONS
-- ================================================================

DO $$
DECLARE
    r RECORD;
    v_academy_id uuid;
BEGIN
    -- 1. Find the academy ID (Assuming single tenant for now or loop all)
    -- We'll try to get it from the first user found or loop through all academies
    
    FOR r IN SELECT id FROM public.academies LOOP
        v_academy_id := r.id;

        -- SHARJAH (Blue)
        IF NOT EXISTS (SELECT 1 FROM public.locations WHERE academy_id = v_academy_id AND name = 'Sharjah') THEN
            INSERT INTO public.locations (academy_id, name, address, color, capacity)
            VALUES (v_academy_id, 'Sharjah', 'Sharjah City', '#3b82f6', 40); -- Blue
            RAISE NOTICE 'Added Sharjah Branch';
        END IF;

        -- AJMAN (Orange)
        IF NOT EXISTS (SELECT 1 FROM public.locations WHERE academy_id = v_academy_id AND name = 'Ajman') THEN
            INSERT INTO public.locations (academy_id, name, address, color, capacity)
            VALUES (v_academy_id, 'Ajman', 'Ajman Corniche', '#f97316', 30); -- Orange
            RAISE NOTICE 'Added Ajman Branch';
        END IF;

        -- DUBAI (Purple)
        IF NOT EXISTS (SELECT 1 FROM public.locations WHERE academy_id = v_academy_id AND name = 'Dubai') THEN
            INSERT INTO public.locations (academy_id, name, address, color, capacity)
            VALUES (v_academy_id, 'Dubai', 'Downtown Dubai', '#8b5cf6', 60); -- Violet
            RAISE NOTICE 'Added Dubai Branch';
        END IF;

    END LOOP;
END $$;
