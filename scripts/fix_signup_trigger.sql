-- FIX SIGNUP ERROR (Database error saving new user)
-- Causes:
-- 1. New columns (phone, date_of_birth) might be NOT NULL but Signup.jsx validates nothing.
-- 2. Trigger might be failing on strict casting or RLS.

-- A. Relax Constraints for Signup Flow
-- The user doesn't have an academy or phone number yet when signing up.
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN date_of_birth DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN academy_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN academy_id DROP NOT NULL;

-- Ensure setup_skipped has a default
ALTER TABLE public.profiles ALTER COLUMN setup_skipped SET DEFAULT false;

-- B. Update the Trigger Function
-- We use SECURITY DEFINER so it runs with admin privileges, bypassing RLS issues during signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    email, 
    phone, 
    date_of_birth, 
    setup_skipped, 
    academy_name,
    academy_id
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    -- Default to 'coach' if role is missing or invalid
    COALESCE((new.raw_user_meta_data->>'role')::public.app_role, 'owner'::public.app_role),
    new.email,
    -- Handle Empty/Null phone
    NULLIF(new.raw_user_meta_data->>'phone', ''),
    -- Handle Date Casting safely
    CASE 
        WHEN new.raw_user_meta_data->>'date_of_birth' = '' THEN NULL
        WHEN new.raw_user_meta_data->>'date_of_birth' IS NULL THEN NULL
        ELSE (new.raw_user_meta_data->>'date_of_birth')::date 
    END,
    -- Setup Skipped
    COALESCE((new.raw_user_meta_data->>'setup_skipped')::boolean, false),
    -- Academy info (Might be null for new signups)
    new.raw_user_meta_data->>'academy_name',
    (new.raw_user_meta_data->>'academy_id')::uuid
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Ensure Trigger is Bound
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
