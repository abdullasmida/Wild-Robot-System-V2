-- ================================================================
-- 32_relax_branch_constraint.sql
-- FIX "branch" NOT NULL ERROR
-- ================================================================

BEGIN;

-- 1. Make 'branch' optional (nullable)
-- The new system uses 'location_id', so we don't need this legacy text column to be mandatory.
ALTER TABLE public.sessions ALTER COLUMN branch DROP NOT NULL;

-- 2. Optional: Populate it from location_id for backward compatibility (if needed)
-- This is just a cleanup step, safe to run.
UPDATE public.sessions s
SET branch = l.name
FROM public.locations l
WHERE s.location_id = l.id
AND s.branch IS NULL;

COMMIT;
