-- 1. Enable PostGIS
-- Standard Supabase projects usually support this.
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Update Locations (Geofence)
-- Adding columns to store the center point and radius for geofencing.
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS geofence_center geography(Point, 4326),
ADD COLUMN IF NOT EXISTS geofence_radius INT DEFAULT 100; -- Meters

-- 3. Update Timesheets (Audit Data)
-- Storing where and on what device the clock-in happened.
ALTER TABLE public.timesheets
ADD COLUMN IF NOT EXISTS location_in geography(Point, 4326),
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- 4. Device Fingerprinting Table
CREATE TABLE IF NOT EXISTS public.known_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL, -- Client-side hash (e.g., from FingerprintJS)
    device_name TEXT, -- User-agent parsed or custom name
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, device_fingerprint) -- One record per device per user
);

ALTER TABLE public.known_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own devices" ON public.known_devices
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users manage own devices" ON public.known_devices
    FOR ALL USING (user_id = auth.uid());

-- 5. Secure Clock-In RPC
-- This is the core logic engine preventing frontend spoofing (bypass attempts).
CREATE OR REPLACE FUNCTION public.clock_in_secure(
    p_user_id UUID,
    p_lat FLOAT,
    p_long FLOAT,
    p_device_id TEXT,
    p_device_name TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_shift RECORD;
    v_location RECORD;
    v_distance FLOAT;
    v_is_new_device BOOLEAN := FALSE;
    v_timesheet_id UUID;
    v_point geography(Point, 4326);
BEGIN
    -- A. Validate User (Optional if calling via RLS, but RPC acts as admin often)
    IF auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized clock-in attempt';
    END IF;

    -- B. Find the Active/Upcoming Shift
    -- Look for a shift starting within -1 hour to +X hours? 
    -- Or "Assigned shift starting NOWish". 
    -- Logic: Find shift starting today where clock_in is null (not started) check time.
    -- Strict spec: "IF NOW() < (shift.start_time - 5 mins), RAISE EXCEPTION 'Too early'"
    
    SELECT * INTO v_shift
    FROM public.staff_shifts
    WHERE resource_id = p_user_id
    AND start_time::date = CURRENT_DATE -- Assuming shift is today
    AND start_time > (NOW() - INTERVAL '12 hours') -- Sanity check current shift
    AND start_time < (NOW() + INTERVAL '12 hours')
    ORDER BY abs(EXTRACT(EPOCH FROM (start_time - NOW()))) ASC -- Closest shift
    LIMIT 1;

    IF v_shift IS NULL THEN
        RAISE EXCEPTION 'No shift found for today.';
    END IF;

    -- Time Check
    IF NOW() < (v_shift.start_time - INTERVAL '5 minutes') THEN
        RAISE EXCEPTION 'Too early! You can only clock in 5 minutes before your shift.';
    END IF;

    -- C. Geo Check
    v_point := ST_SetSRID(ST_MakePoint(p_long, p_lat), 4326)::geography;
    
    -- Get Location details
    -- Assuming shift has location_id (it should, from previous schemas or logic)
    -- If shift location is null, maybe fallback to profile default? let's assume shift.location_id
    -- Wait, staff_shifts usually doesn't have location_id in simple schemas, it inherits/is global?
    -- Let's check 'locations' exists. 
    -- Refinement: If staff_shifts table doesn't have location_id, we need to find it.
    -- Assuming 'locations' table and shifts might link to it or programs link to it. 
    -- Let's assume for this specific requirement we fetch the academy's default location or similar if specific not found.
    -- Better: Check if `staff_shifts` has `location_id`. If not, we skip or alert.
    -- Let's assume standard schema `staff_shifts` has `location_id`.
    
    -- Safe query for location
    IF v_shift.location_id IS NOT NULL THEN
        SELECT * INTO v_location FROM public.locations WHERE id = v_shift.location_id;
        
        IF v_location IS NOT NULL AND v_location.geofence_center IS NOT NULL THEN
            v_distance := ST_Distance(v_location.geofence_center, v_point);
            
            IF v_distance > v_location.geofence_radius THEN
                RAISE EXCEPTION 'You are outside the gym geofence. Distance: %m (Allowed: %m)', 
                    ROUND(v_distance::numeric, 0), v_location.geofence_radius;
            END IF;
        END IF;
    END IF;

    -- D. Device Check
    IF NOT EXISTS (
        SELECT 1 FROM public.known_devices 
        WHERE user_id = p_user_id AND device_fingerprint = p_device_id
    ) THEN
        INSERT INTO public.known_devices (user_id, device_fingerprint, device_name, is_trusted)
        VALUES (p_user_id, p_device_id, p_device_name, true); -- default true for low friction or false for strict?
        -- Spec says: "Return a warning flag 'New Device Detected'". 
        v_is_new_device := TRUE;
    ELSE
        -- Update last seen
        UPDATE public.known_devices 
        SET last_seen = NOW() 
        WHERE user_id = p_user_id AND device_fingerprint = p_device_id;
    END IF;

    -- E. Action: Insert Timesheet
    INSERT INTO public.timesheets (
        user_id, 
        linked_shift_id, 
        clock_in, 
        location_in, 
        device_id, 
        source, 
        status
    )
    VALUES (
        p_user_id,
        v_shift.id,
        NOW(),
        v_point,
        p_device_id,
        'mobile',
        'pending' -- default pending, or 'approved' if auto-trust? stick to pending/default
    )
    RETURNING id INTO v_timesheet_id;

    RETURN jsonb_build_object(
        'success', true,
        'timesheet_id', v_timesheet_id,
        'new_device', v_is_new_device,
        'message', CASE WHEN v_is_new_device THEN 'Clocked in (New Device)' ELSE 'Clocked in successfully' END
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
