-- 29_link_orphans.sql

-- FIX: Link orphan staff (like 'abdulla20') to the main Academy
-- This ensures they see "PSA" instead of placeholders.

DO $$
DECLARE
    main_academy_id UUID;
BEGIN
    -- 1. Get the first academy (The Owner's Academy)
    SELECT id INTO main_academy_id FROM public.academies LIMIT 1;

    IF main_academy_id IS NOT NULL THEN
        -- 2. Link all unconnected Staff to this Academy
        UPDATE public.profiles
        SET academy_id = main_academy_id
        WHERE academy_id IS NULL 
        AND role IN ('coach', 'head_coach', 'manager', 'admin');
        
        RAISE NOTICE 'Linked orphans to Academy ID: %', main_academy_id;
    END IF;
END $$;
