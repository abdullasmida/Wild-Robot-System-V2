-- PRICING INFRASTRUCTURE SETUP
-- Creates subscription_plans and updates academies for limits enforcement.

-- 1. Create 'subscription_plans' table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    tier_slug text NOT NULL UNIQUE, -- 'starter', 'pro', 'elite'
    price_monthly integer DEFAULT 0,
    price_yearly integer DEFAULT 0,
    max_athletes integer, -- NULL means Unlimited
    features jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 2. Update 'academies' table
-- Add columns for plan tracking
DO $$ 
BEGIN 
    -- current_plan_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'current_plan_id') THEN 
        ALTER TABLE public.academies ADD COLUMN current_plan_id uuid REFERENCES public.subscription_plans(id); 
    END IF;

    -- subscription_status (Ensuring it exists, though usually added previously)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'subscription_status') THEN 
        ALTER TABLE public.academies ADD COLUMN subscription_status text DEFAULT 'trial'; 
    END IF;

    -- trial_ends_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'trial_ends_at') THEN 
        ALTER TABLE public.academies ADD COLUMN trial_ends_at timestamptz DEFAULT (now() + interval '14 days'); 
    END IF;

END $$;

-- 3. Seed Data (Upsert Logic to prevent duplicates)
-- STARTER
INSERT INTO public.subscription_plans (tier_slug, name, price_monthly, price_yearly, max_athletes, features)
VALUES (
    'starter', 
    'Starter', 
    0, 
    0, 
    10, 
    '["Up to 10 Athletes", "Basic Scheduling", "Attendance Tracking", "Mobile App Access"]'::jsonb
) ON CONFLICT (tier_slug) DO UPDATE SET 
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly, 
    price_yearly = EXCLUDED.price_yearly,
    max_athletes = EXCLUDED.max_athletes,
    features = EXCLUDED.features;

-- PRO
INSERT INTO public.subscription_plans (tier_slug, name, price_monthly, price_yearly, max_athletes, features)
VALUES (
    'pro', 
    'Pro', 
    29, 
    24, 
    50, 
    '["Up to 50 Athletes", "Video Analysis", "Performance Evals", "Parent Portal"]'::jsonb
) ON CONFLICT (tier_slug) DO UPDATE SET 
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly, 
    price_yearly = EXCLUDED.price_yearly,
    max_athletes = EXCLUDED.max_athletes,
    features = EXCLUDED.features;

-- ELITE
INSERT INTO public.subscription_plans (tier_slug, name, price_monthly, price_yearly, max_athletes, features)
VALUES (
    'elite', 
    'Elite', 
    99, 
    81, 
    NULL, -- Unlimited
    '["Unlimited Athletes", "Advanced Analytics", "Tournament Planner", "Live Streaming"]'::jsonb
) ON CONFLICT (tier_slug) DO UPDATE SET 
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly, 
    price_yearly = EXCLUDED.price_yearly,
    max_athletes = EXCLUDED.max_athletes,
    features = EXCLUDED.features;


-- 4. RLS Policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public plans)
DROP POLICY IF EXISTS "Read access for plans" ON public.subscription_plans;
CREATE POLICY "Read access for plans" ON public.subscription_plans FOR SELECT TO authenticated, anon USING (true);


NOTIFY pgrst, 'reload config';

SELECT 'Pricing Infrastructure Deployed & Seeded' as result;
