-- 🕵️‍♂️ CHECK USER PROFILE & ROLE
-- Why is he seeing "Owner Setup"? Let's check his role and academy_id.

SELECT 
    p.email, 
    p.role, 
    p.academy_id, 
    p.first_name, 
    sd.job_title
FROM profiles p
LEFT JOIN staff_details sd ON p.id = sd.profile_id
WHERE p.email = 'abdulla@wildrobot-app.com';
