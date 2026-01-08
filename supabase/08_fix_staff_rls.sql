-- 🛠️ FIX RLS FOR STAFF DETAILS
-- This script allows Owners to add/edit staff details for their academy.

-- 1. Enable RLS on staff_details (just to be safe)
ALTER TABLE public.staff_details ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if any (conflicts)
DROP POLICY IF EXISTS "Owners can manage staff details" ON public.staff_details;

-- 3. Create Policy: Owners can manage staff details
-- Logic: Allow if the user (auth.uid()) is an 'owner' of the SAME academy as the staff member.
CREATE POLICY "Owners can manage staff details"
ON public.staff_details
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
        AND profiles.academy_id = staff_details.academy_id
    )
);

-- 4. Create Policy: Owners can view staff details
-- Logic: Owners can see all staff details for their academy
CREATE POLICY "Owners can view staff details"
ON public.staff_details
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
        AND profiles.academy_id = staff_details.academy_id
    )
);

SELECT '✅ STAFF RLS FIXED: Owners can now add staff details.' as result;
