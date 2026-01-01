-- UPGRADE SCHEMA: ENTERPRISE FEATURES
-- Adds support for Business Types, Currencies, and Branding

DO $$ 
BEGIN 
    -- 1. Add 'business_type' (academy vs club)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'business_type') THEN 
        ALTER TABLE public.academies ADD COLUMN business_type text DEFAULT 'academy'; 
        -- Constraint check
        ALTER TABLE public.academies ADD CONSTRAINT check_business_type CHECK (business_type IN ('academy', 'club', 'hybrid'));
    END IF;

    -- 2. Add 'currency' (ISO Code)
    -- Note: We used 'currency' in previous fix, this ensures it exists or verifies default.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'currency') THEN 
        ALTER TABLE public.academies ADD COLUMN currency text DEFAULT 'AED'; 
    END IF;

    -- 3. Add 'subscription_model' (Term vs Monthly)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'subscription_model') THEN 
        ALTER TABLE public.academies ADD COLUMN subscription_model text DEFAULT 'term_based';
        -- Constraint check
        ALTER TABLE public.academies ADD CONSTRAINT check_subscription_model CHECK (subscription_model IN ('term_based', 'monthly_recurring'));
    END IF;

    -- 4. Add 'brand_color' (Theming)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'brand_color') THEN 
        ALTER TABLE public.academies ADD COLUMN brand_color text DEFAULT '#10b981'; -- Default Emerald-500
    END IF;

    -- 5. Add 'setup_completed' (Onboarding Tracker)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'setup_completed') THEN 
        ALTER TABLE public.academies ADD COLUMN setup_completed boolean DEFAULT false; 
    END IF;

END $$;

-- Reload Schema to update PostgREST API
NOTIFY pgrst, 'reload config';

SELECT 'Enterprise Schema Applied Successfully' as result;
