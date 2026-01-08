-- 🕵️‍♂️ CHECK ROLE & OWNERSHIP
-- Did he accidentally become an owner?

SELECT 
    p.email, 
    p.role, 
    p.academy_id, 
    a.name as academy_name,
    a.owner_id
FROM profiles p
LEFT JOIN academies a ON p.academy_id = a.id
WHERE p.email = 'abdulla@wildrobot-app.com';
