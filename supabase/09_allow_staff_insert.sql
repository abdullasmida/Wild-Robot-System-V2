-- 🛠️ FIX FALLBACK PERMISSIONS
-- This allows the "Local/Fallback" mode to work by letting users insert their own details.

-- 1. Create Policy: Allow users to insert their OWN staff_details
CREATE POLICY "Users can insert own details"
ON public.staff_details
FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- 2. Grant Insert Permission (just in case)
GRANT INSERT ON public.staff_details TO authenticated;

SELECT '✅ PERMISSIONS FIXED: Fallback mode should now work.' as result;
