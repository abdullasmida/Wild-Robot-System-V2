-- FIX: Add missing 'type' column to academies table
-- The frontend sends 'type' (Mapped to Sport Name, e.g., 'Gymnastics'), but the DB is missing it.

ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'General';

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
