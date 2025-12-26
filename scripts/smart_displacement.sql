-- 1. CLEANUP OLD LOGIC
DROP TRIGGER IF EXISTS on_device_limit_displacement ON public.active_sessions;
DROP FUNCTION IF EXISTS public.handle_device_limit_displacement();
DROP TRIGGER IF EXISTS check_device_limit_insert ON public.active_sessions;
DROP FUNCTION IF EXISTS public.enforce_device_limit();

-- 2. CREATE FUNCTION FOR SMART DISPLACEMENT (Newest Wins)
CREATE OR REPLACE FUNCTION public.handle_smart_displacement()
RETURNS TRIGGER AS $$
DECLARE
    v_max_devices INT;
    v_current_count INT;
    v_oldest_id UUID;
BEGIN
    -- Get user's limit from profiles (default 1 if null)
    SELECT COALESCE(max_allowed_devices, 1) INTO v_max_devices
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Count existing sessions (excluding the one we are about to add if it was an update, but this is insert)
    SELECT COUNT(*) INTO v_current_count
    FROM public.active_sessions
    WHERE user_id = NEW.user_id;

    -- If we are at or above limit, we need to make room for ONE new session (NEW)
    -- So if count >= limit, we must delete (count - limit + 1) oldest sessions
    -- Usually just 1, but loops to be safe or just delete oldest 1.
    
    IF v_current_count >= v_max_devices THEN
        -- Find oldest session(s)
        FOR v_oldest_id IN
            SELECT id
            FROM public.active_sessions
            WHERE user_id = NEW.user_id
            ORDER BY last_active ASC -- Oldest active time
            LIMIT (v_current_count - v_max_devices + 1)
        LOOP
            -- DELETE IT
            DELETE FROM public.active_sessions WHERE id = v_oldest_id;
            
            -- LOG IT (Audit)
            INSERT INTO auth.audit_log_entries (instance_id, payload)
            VALUES (
                '00000000-0000-0000-0000-000000000000', -- System ID placeholder
                json_build_object(
                    'action', 'session_displaced',
                    'user_id', NEW.user_id,
                    'displaced_session_id', v_oldest_id,
                    'new_device', NEW.user_agent,
                    'timestamp', now()
                )
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE TRIGGER
CREATE TRIGGER trigger_smart_displacement
BEFORE INSERT ON public.active_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_smart_displacement();

-- 4. RESET STATE
TRUNCATE TABLE public.active_sessions;
