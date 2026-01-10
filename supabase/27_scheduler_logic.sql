/*
  # SCHEDULER PHASE 3: LOGIC & PUBLISHING 🧠
  
  Goal: Implement "Draft to Publish" workflow for the scheduler.
  
  1. Add `is_published` column to `sessions`.
  2. Add `notes_for_staff` column.
  3. Create RPC function `publish_weekly_shifts` for batch updates.
*/

BEGIN;

-- =========================================================
-- 1. SCHEMA UPDATES
-- =========================================================

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notes_for_staff text;

-- =========================================================
-- 2. PUBLISH RPC FUNCTION
-- =========================================================

CREATE OR REPLACE FUNCTION publish_weekly_shifts(
    p_academy_id uuid,
    p_start_date timestamptz,
    p_end_date timestamptz
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count int;
BEGIN
    -- Update all draft sessions within the range to published
    WITH updated_rows AS (
        UPDATE public.sessions
        SET is_published = true
        WHERE academy_id = p_academy_id
          AND start_time >= p_start_date
          AND start_time <= p_end_date
          AND is_published = false
        RETURNING 1
    )
    SELECT count(*) INTO v_count FROM updated_rows;

    RETURN v_count;
END;
$$;

COMMIT;
