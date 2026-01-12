-- Add DOB to profiles for Age Calculation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dob') THEN
        ALTER TABLE public.profiles ADD COLUMN dob DATE;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
