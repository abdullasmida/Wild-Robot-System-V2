-- Add avatar_color to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#10b981'; -- Emerald default

-- No RLS changes needed as it's just a column on an existing table that likely has policies.
