-- Add specialization to staff_details
ALTER TABLE public.staff_details ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Verify creation of staff_details if it doesn't exist (it should be in enterprise_foundation)
-- We rely on enterprise_foundation.sql being run.
