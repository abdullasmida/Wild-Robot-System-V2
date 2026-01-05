-- 1. Update staff_shifts table
ALTER TABLE public.staff_shifts 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
ADD COLUMN IF NOT EXISTS cost_estimate numeric DEFAULT 0;

-- 2. Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#10b981', -- Emerald default
    capacity INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage locations" ON public.locations
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Authenticated users can view locations" ON public.locations
    FOR SELECT USING (auth.role() = 'authenticated');


-- 3. Update profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;

-- 4. Seed Mock Locations (Idempotent-ish)
-- Note: In a real migration, we'd need a valid academy_id. 
-- For now, we will rely on the UI or backend logic to create these properly linked to an academy 
-- or user must manually insert them with their academy_id if using SQL editor.
-- However, since I need this for the "Rebuild", I'll create a function to seed them for the current user's academy if missing.

CREATE OR REPLACE FUNCTION seed_default_locations(target_academy_id UUID)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM locations WHERE academy_id = target_academy_id) THEN
        INSERT INTO locations (academy_id, name, color) VALUES
        (target_academy_id, 'Main Gym Hall', '#3b82f6'),
        (target_academy_id, 'Trampoline Zone', '#f59e0b'),
        (target_academy_id, 'Dance Studio', '#ec4899');
    END IF;
END;
$$ LANGUAGE plpgsql;
