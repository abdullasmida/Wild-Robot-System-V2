-- FIX: Add missing columns to 'academies' table
-- The error "Could not find column... in schema cache" means these columns do not exist in the database yet.

-- 1. setup_completed
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS setup_completed boolean DEFAULT false;

-- 2. brand_color
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#10b981';

-- 3. business_type (academy vs club)
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS business_type text DEFAULT 'academy';

-- 4. currency
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED';

-- 5. subscription_model
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS subscription_model text DEFAULT 'term_based';

-- 6. subscription_status
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';

-- Refresh the schema cache (PostgREST sometimes needs a nudge, though usually automatic)
NOTIFY pgrst, 'reload config';
