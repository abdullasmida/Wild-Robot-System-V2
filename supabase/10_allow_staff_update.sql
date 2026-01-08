-- 🛠️ ALLOW UPDATE POLICY
-- This allows logged-in staff members to update their own details (e.g. availability)

CREATE POLICY "Users can update own details"
ON public.staff_details
FOR UPDATE
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

GRANT UPDATE ON public.staff_details TO authenticated;

SELECT '✅ UPDATE PERMISSIONS FIXED' as result;
