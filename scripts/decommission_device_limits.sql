-- 1. DROP TRIGGER
DROP TRIGGER IF EXISTS on_device_limit_displacement ON public.active_sessions;

-- 2. DROP FUNCTION
DROP FUNCTION IF EXISTS public.handle_device_limit_displacement();

-- 3. PURGE SESSIONS (Unlock everyone)
TRUNCATE TABLE public.active_sessions;

-- 4. OPTIONAL: Drop the table entirely if we don't want to track anything?
-- For now, we just leave the table but stop enforcing.
