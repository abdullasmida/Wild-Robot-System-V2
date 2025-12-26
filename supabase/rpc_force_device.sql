-- ---------------------------------------------------------
-- RPC: FORCE DEVICE ACCESS (Atomic Wipe & Register)
-- ---------------------------------------------------------
-- This function deletes all sessions for a user and immediately 
-- inserts the current device, preventing RLS race conditions.

CREATE OR REPLACE FUNCTION force_device_access(target_user_id UUID, current_fingerprint TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions (bypassing RLS for the cleanup)
AS $$
BEGIN
    -- 1. Wipe all sessions for this user
    DELETE FROM public.active_sessions 
    WHERE user_id = target_user_id;

    -- 2. Register the current device
    INSERT INTO public.active_sessions (user_id, user_agent, last_active)
    VALUES (target_user_id, current_fingerprint, now());
END;
$$;
