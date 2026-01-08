-- 🛠️ FIX ABDULLA'S ACCOUNT (Link to Academy)
-- Update the user to belong to the first available academy

UPDATE profiles
SET 
    role = 'coach', -- System needs this exact role to direct to Coach Dashboard
    academy_id = (SELECT id FROM academies LIMIT 1) -- Auto-select your academy
WHERE email = 'abdulla@wildrobot-app.com';

-- Update the staff details too just in case
UPDATE staff_details
SET 
    academy_id = (SELECT id FROM academies LIMIT 1)
WHERE profile_id = (SELECT id FROM profiles WHERE email = 'abdulla@wildrobot-app.com');

-- Check the result
SELECT email, role, academy_id FROM profiles WHERE email = 'abdulla@wildrobot-app.com';
