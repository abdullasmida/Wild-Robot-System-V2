-- 11_staff_athlete_separation.sql

-- 1. Create a Postgres Function is_staff_member(role)
-- This function allows us to easily distinguish between staff and athletes in RLS policies and application logic.
CREATE OR REPLACE FUNCTION is_staff_member(user_role text)
RETURNS boolean AS $$
BEGIN
  -- Returns TRUE for staff roles ('owner', 'admin', 'manager', 'head_coach', 'coach')
  -- Returns FALSE for others (e.g., 'athlete', 'parent', 'student')
  RETURN user_role IN ('owner', 'admin', 'manager', 'head_coach', 'coach');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Update invitations table: Add a profile_id column
-- This column facilitates the "Claim Profile" feature (QR Code flow)
-- Logic: If profile_id is present, the invite allows claiming an existing Athlete Profile.
--        If profile_id is NULL, it creates a new Staff Profile.
ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE;

-- Add a comment to explain the column usage
COMMENT ON COLUMN invitations.profile_id IS 'If set, this invitation claims an existing Athlete Profile. If NULL, it creates a new Staff Profile.';
