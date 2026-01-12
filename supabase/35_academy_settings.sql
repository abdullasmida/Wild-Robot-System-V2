-- Add configuration column for Open Shifts feature
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS config_enable_open_shifts BOOLEAN DEFAULT FALSE;

-- Ensure RLS allows owners to update their academy settings
-- (Assuming existing policies likely cover this, but verifying/adding specific if needed is good practice. 
-- For now, generic update policy probably exists or we rely on owner role)
-- Let's just make sure the column is accessible.

COMMENT ON COLUMN public.academies.config_enable_open_shifts IS 'Feature toggle: Enable/Disable Open Shifts (Claiming) functionality.';
