-- ⚠️ EMERGENCY DATABASE FIX ⚠️
-- Execute this script in your Supabase SQL Editor to resolve "Access Denied" and enable Smart Eviction.

-- 1. HARD RESET: Clear all stuck sessions/ghost logins
TRUNCATE TABLE public.active_sessions;

-- 2. INCREASE ADMIN LIMIT: Ensure Project Manager has access (Minimum 2 Devices)
UPDATE public.profiles 
SET max_allowed_devices = 2 
WHERE email = 'abdulla.smozy@gmail.com';

-- 3. SMART EVICTION ENGINE (The Iron Dome Upgrade)
-- Logic: If user tries to login and is at capacity, automatically kick out the OLDEST session.
CREATE OR REPLACE FUNCTION handle_device_limit_displacement()
RETURNS TRIGGER AS $$
DECLARE
    device_limit INTEGER;
    current_count INTEGER;
BEGIN
    -- Get User's Limit
    SELECT max_allowed_devices INTO device_limit
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Default to 1 if not set
    IF device_limit IS NULL THEN
        device_limit := 1;
    END IF;

    -- Check current count
    SELECT COUNT(*) INTO current_count
    FROM public.active_sessions
    WHERE user_id = NEW.user_id;

    -- If we are at (or above) capacity, EVICT the oldest
    IF current_count >= device_limit THEN
        DELETE FROM public.active_sessions
        WHERE id = (
            SELECT id FROM public.active_sessions
            WHERE user_id = NEW.user_id
            ORDER BY last_active ASC
            LIMIT 1
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
DROP TRIGGER IF EXISTS on_device_limit_displacement ON public.active_sessions;
CREATE TRIGGER on_device_limit_displacement
BEFORE INSERT ON public.active_sessions
FOR EACH ROW
EXECUTE FUNCTION handle_device_limit_displacement();
