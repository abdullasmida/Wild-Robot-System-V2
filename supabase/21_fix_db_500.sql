/*
  # FIX 500 ERROR & STABILIZE DB 🩹
  
  Goal: Resolve the "Internal Server Error" (500) interfering with Login.
  Cause: Likely RLS Recursion (Profile checking Profile) or Trigger failure.
  
  EXECUTION:
  1. Replace recursive RLS with a safe SECURITY DEFINER function.
  2. Ensure Staff Details table exists before trigger fires.
  3. Grant strict permissions.
*/

BEGIN;

-- 1. PREVENT RLS RECURSION (The "Infinite Loop" Fix)
-- Create a secure function to get the current user's academy WITHOUT triggering RLS loops
CREATE OR REPLACE FUNCTION public.get_my_academy_id_v2()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT academy_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop the potentially buggy policy
DROP POLICY IF EXISTS "View Academy Colleagues" ON public.profiles;
DROP POLICY IF EXISTS "Academy members can view colleagues" ON public.profiles;

-- Re-create it using the safe function
CREATE POLICY "View Academy Colleagues" 
ON public.profiles FOR SELECT 
USING (
    academy_id = public.get_my_academy_id_v2()
);


-- 2. ENSURE DEPENDENCIES EXIST
-- If script 18 failed halfway, this might be missing
CREATE TABLE IF NOT EXISTS public.staff_details (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) NOT NULL UNIQUE,
    academy_id uuid REFERENCES public.academies(id),
    specialization text,
    job_title text,
    availability jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. REFRESH TRIGGER
-- Drop and recreate to ensure it matches the table
DROP TRIGGER IF EXISTS on_staff_profile_change ON public.profiles;

CREATE OR REPLACE FUNCTION public.handle_staff_details_sync() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IN ('coach', 'head_coach', 'manager') AND NEW.academy_id IS NOT NULL THEN
        INSERT INTO public.staff_details (profile_id, academy_id, job_title)
        VALUES (
            NEW.id, 
            NEW.academy_id, 
            INITCAP(Replace(NEW.role::text, '_', ' '))
        )
        ON CONFLICT (profile_id) 
        DO UPDATE SET academy_id = EXCLUDED.academy_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_staff_profile_change
AFTER INSERT OR UPDATE OF role, academy_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_staff_details_sync();


-- 4. EMERGENCY PERMISSIONS (Just in case)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.staff_details TO authenticated;

COMMIT;
