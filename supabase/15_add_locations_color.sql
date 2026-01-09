-- 15_add_locations_color.sql
-- Fix: Add 'color' column to 'locations' table for UI differentiation

DO $$ 
BEGIN
    -- Check/Add color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'color') THEN
        ALTER TABLE public.locations ADD COLUMN color TEXT DEFAULT '#10B981'; -- Emerald default
    END IF;

END $$;

-- Refresh Schema Cache
NOTIFY pgrst, 'reload config';
