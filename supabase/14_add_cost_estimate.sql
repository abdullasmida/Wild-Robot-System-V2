-- 14_add_cost_estimate.sql
-- Fix: Add missing 'cost_estimate' column to 'staff_shifts' table

DO $$ 
BEGIN
    -- Check/Add cost_estimate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_shifts' AND column_name = 'cost_estimate') THEN
        ALTER TABLE public.staff_shifts ADD COLUMN cost_estimate NUMERIC DEFAULT 0;
    END IF;

END $$;

-- Refresh Schema Cache
NOTIFY pgrst, 'reload config';
