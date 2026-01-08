-- Add availability to staff_details
ALTER TABLE public.staff_details ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}'::jsonb;
-- Structure: { "monday": ["09:00-12:00", "15:00-19:00"], "tuesday": ... }
