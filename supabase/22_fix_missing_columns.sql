/*
  # FIX MISSING COLUMNS 🛠️
  
  Goal: Fix the "column does not exist" error crashing the Scheduler.
  
  Changes:
  1. Add 'cost_estimate' (decimal) to staff_shifts.
  2. Add 'status' (text) to staff_shifts if missing.
*/

BEGIN;

ALTER TABLE public.staff_shifts
ADD COLUMN IF NOT EXISTS cost_estimate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'published'; -- 'draft' or 'published'

-- Add index for status just in case
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.staff_shifts(status);

COMMIT;
