-- 1. Finance (Accountant)
-- Email: abdulla.smozy+finance@gmail.com
UPDATE public.profiles
SET coach_type = 'accountant'
WHERE id = '127de1b5-157f-4ff5-a794-cd3f495d27fb';

-- 2. Head Coach (Technical Director)
-- Email: abdulla.smozy+headcoach@gmail.com
UPDATE public.profiles
SET coach_type = 'head_coach'
WHERE id = 'ae0b0f08-dbba-4ee7-8586-16b926b20712';

-- 3. HR Manager (Staff)
-- Email: abdulla.smozy+hr@gmail.com
UPDATE public.profiles
SET coach_type = 'hr'
WHERE id = '3d8cac5b-7867-4639-9d2f-c4b84657d008';

-- 4. Activity Manager (Operations)
-- Email: abdulla.smozy+manager@gmail.com
UPDATE public.profiles
SET coach_type = 'manager'
WHERE id = 'c318b10d-d8c0-4c18-9e0a-ff029a6e868d';

-- 5. Super Admin (Your Main Account)
-- Ensures you always have full access
UPDATE public.profiles
SET coach_type = 'super_admin'
WHERE email = 'abdulla.smozy@gmail.com'; 
-- (Assuming this is your main email)

-- Verify Changes
SELECT email, coach_type, id FROM public.profiles;
