-- 🛠️ SUPER HEALTH CHECK - STEP 2: FIX SECURITY
-- Run this AFTER Step 1 is successful.

-- 1. Allow Staff to View Own Shifts
DROP POLICY IF EXISTS "Staff can view own shifts" ON public.staff_shifts;
CREATE POLICY "Staff can view own shifts" 
ON public.staff_shifts 
FOR SELECT 
USING (auth.uid() = staff_id);

-- 2. Allow Staff to Update Own Availability
DROP POLICY IF EXISTS "Staff can update own details" ON public.staff_details;
CREATE POLICY "Staff can update own details"
ON public.staff_details
FOR UPDATE
USING (auth.uid() = profile_id);

-- 3. Grant Permissions
GRANT ALL ON public.staff_shifts TO authenticated;
GRANT ALL ON public.staff_details TO authenticated;
