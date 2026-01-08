-- 0. Create Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'athlete',
    token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure academy_id exists on invitations (if table existed before)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'academy_id') THEN
        ALTER TABLE public.invitations ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 1. Create Levels Table
CREATE TABLE IF NOT EXISTS public.levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academy_id, name)
);

-- Ensure academy_id exists on levels (if table existed before)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'levels' AND column_name = 'academy_id') THEN
        ALTER TABLE public.levels ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Add Policies for Levels
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage levels" ON public.levels
    USING (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()))
    WITH CHECK (academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid()));

CREATE POLICY "Authenticated view levels" ON public.levels
    FOR SELECT TO authenticated USING (true);


-- 3. Modify Athletes Table
-- Adding Email, Coach, and Level
ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL;

-- 4. Permissions
GRANT ALL ON public.levels TO authenticated;

-- 5. Helper Data (Optional: Add some default levels for testing if needed, though UI should handle it)
-- INSERT INTO public.levels (academy_id, name, order_index) 
-- VALUES ('<ACADEMY_ID>', 'Beginner', 1), ('<ACADEMY_ID>', 'Intermediate', 2);
