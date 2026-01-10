/*
  # SCHEDULER PHASE 2: CONNECTEAM ENHANCEMENTS 🚀
  
  Goal: Add "Job Types" and "Open Shifts" logic to support the Live Job Scheduler.
  
  EXECUTION ORDER:
  1. Add Columns to Sessions
  2. Indexing
  3. RLS Update (Allow reading Open Shifts)
*/

BEGIN;

-- =========================================================
-- 1. SCHEMA ENHANCEMENTS
-- =========================================================

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS job_type text DEFAULT 'Coaching', -- e.g. 'Gymnastics', 'Meeting', 'Maintenance'
ADD COLUMN IF NOT EXISTS is_open_for_claim boolean DEFAULT false, -- If true, staff can see and claim it
ADD COLUMN IF NOT EXISTS capacity int DEFAULT 1; -- How many staff can be assigned

-- Add index for the "Open Shifts" query
CREATE INDEX IF NOT EXISTS idx_sessions_open_claim ON public.sessions(academy_id, is_open_for_claim);

-- =========================================================
-- 2. RLS UPDATE (The "Marketplace" Logic)
-- =========================================================

-- We need to update "Staff View Sessions" policy.
-- Previously: Staff could only see sessions they were IN assignments for (or just academy wide, but let's be specific).
-- Current Policy from 24_scheduler: "Staff View Sessions" USING (academy_id matching).
-- This actually ALREADY allows them to see ALL sessions in the academy, which is fine for the "Open Board".
-- But let's refine it to ensures they can explicitly see Open Shifts even if we restrict others later.

-- Dropping previous broad policy if we want to be stricter, but for now, 
-- "View Academy Colleagues" logic applies here too. 
-- "If you are in the academy, you can see the schedule." -> This is standard for Connecteam.
-- So the existing policy is likely sufficient, but let's explicitly comment that we rely on:
-- POLICY "Staff View Sessions" USING (me.academy_id = sessions.academy_id)

-- However, we must ensure they can INSERT into session_assignments if they "Claim" a shift.

-- New Policy: "Staff Claim Open Shifts"
CREATE POLICY "Staff Claim Open Shifts"
ON public.session_assignments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = session_assignments.session_id
        AND s.is_open_for_claim = true
        AND s.academy_id = (SELECT academy_id FROM public.profiles WHERE id = auth.uid())
    )
    AND
    staff_id = auth.uid() -- Can only claim for self
);

-- =========================================================
-- 3. UTILITY: JOB TYPE COLORS (Optional Data Seeding)
-- =========================================================
-- This would typically be handled by the frontend or a 'job_types' table, 
-- but for now we stick to text column + frontend mapping.

COMMIT;
