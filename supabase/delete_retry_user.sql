-- 🗑️ DELETE SPECIFIC USER FOR RETRY
-- Change the email to the one you want to remove

DELETE FROM auth.users WHERE email = 'abdullasmida@gmail.com';

SELECT 'User deleted successfully' as result;
