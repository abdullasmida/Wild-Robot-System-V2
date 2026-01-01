-- FIX: Add UNIQUE constraint to owner_id in academies table
-- The error "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- happens because we rely on 'owner_id' to be unique for the UPSERT operation, but the database doesn't enforce it yet.

ALTER TABLE public.academies
ADD CONSTRAINT academies_owner_id_key UNIQUE (owner_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
