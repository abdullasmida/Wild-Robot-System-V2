-- 1. Create Academy Settings (Singleton Config)
-- This table stores configuration for the entire academy/branch. 
-- In a multi-tenant setup, 'academy_id' is the tenant. 
-- Singleton enforcement: ID can be constrained or we rely on unique academy_id.

CREATE TABLE IF NOT EXISTS public.academy_settings (
    academy_id UUID PRIMARY KEY REFERENCES public.academies(id) ON DELETE CASCADE,
    
    -- Work Week Config
    -- Stores active days: [0,1,2,3,4] (Sun-Thu in Dubai/Global)
    work_week_config JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
    
    -- Payroll Config
    -- { "cycle": "monthly", "daily_overtime_threshold": 8, "overtime_multiplier": 1.5 }
    payroll_config JSONB DEFAULT '{"cycle": "monthly", "daily_overtime_threshold": 9, "overtime_multiplier": 1.5}'::jsonb,
    
    -- Break Rules
    -- { "auto_deduct": true, "threshold_hours": 8, "deduction_minutes": 30 }
    break_rules JSONB DEFAULT '{"auto_deduct": false, "threshold_hours": 6, "deduction_minutes": 30}'::jsonb,
    
    -- Clock Rules
    -- { "restrict_early_clock_in": true, "early_window_minutes": 5, "auto_clock_out_hours": 12 }
    clock_rules JSONB DEFAULT '{"restrict_early_clock_in": false, "early_window_minutes": 15, "auto_clock_out_hours": 14}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Settings at Academy Level
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage settings" ON public.academy_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('owner', 'admin')
            AND profiles.academy_id = academy_settings.academy_id
        )
    );
    
CREATE POLICY "Staff view settings" ON public.academy_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.academy_id = academy_settings.academy_id
        )
    );


-- 2. Enhance Staff Shifts (Payable Hours)
ALTER TABLE public.staff_shifts 
ADD COLUMN IF NOT EXISTS payable_hours NUMERIC; 
-- This stores the final calculated hours after break deductions.


-- 3. Trigger Function: Auto Break Deduction
CREATE OR REPLACE FUNCTION public.handle_auto_break_deduction()
RETURNS TRIGGER AS $$
DECLARE
    v_academy_id UUID;
    v_break_rules JSONB;
    v_total_hours NUMERIC;
    v_threshold NUMERIC;
    v_deduction NUMERIC;
BEGIN
    -- Only run on Clock Out (when end_time is set)
    IF NEW.end_time IS NOT NULL AND (OLD.end_time IS NULL OR NEW.end_time <> OLD.end_time) THEN
        
        -- Get Staff's Academy ID
        SELECT academy_id INTO v_academy_id 
        FROM public.profiles 
        WHERE id = NEW.resource_id; -- Assuming resource_id is staff profile id
        
        -- Get Break Rules
        SELECT break_rules INTO v_break_rules
        FROM public.academy_settings
        WHERE academy_id = v_academy_id;
        
        -- Default hours logic
        v_total_hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
        
        -- If rules exist and auto-deduct is on
        IF v_break_rules IS NOT NULL AND (v_break_rules->>'auto_deduct')::boolean IS TRUE THEN
            v_threshold := (v_break_rules->>'threshold_hours')::numeric;
            v_deduction := (v_break_rules->>'deduction_minutes')::numeric / 60;
            
            IF v_total_hours > v_threshold THEN
                -- Apply Deduction
                NEW.payable_hours := GREATEST(0, v_total_hours - v_deduction);
            ELSE
                NEW.payable_hours := v_total_hours;
            END IF;
        ELSE
            -- No deduction
            NEW.payable_hours := v_total_hours;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach Trigger
DROP TRIGGER IF EXISTS trigger_auto_break ON public.staff_shifts;
CREATE TRIGGER trigger_auto_break
    BEFORE UPDATE ON public.staff_shifts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auto_break_deduction();

-- 5. RPC Guardrail for Clock In (Optional Helper)
-- To be called by client check before inserting logic if we want strict server enforcement, 
-- but client-side check + standard insert usually fine. 
-- Strict enforcement: "BEFORE INSERT" trigger checking NOW().
