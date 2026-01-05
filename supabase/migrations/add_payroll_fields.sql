-- Add payroll fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time')),
ADD COLUMN IF NOT EXISTS salary NUMERIC,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;

-- Ensure avatar_color exists (idempotent check)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#10b981';
