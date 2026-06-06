/*
  # Add email lookup to user profiles

  This lets authenticated users find another profile by email when creating
  an evaluation. Each user profile stores the auth email in lowercase.
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email text;

UPDATE user_profiles AS profile
SET email = lower(auth_user.email)
FROM auth.users AS auth_user
WHERE profile.user_id = auth_user.id
  AND (profile.email IS NULL OR profile.email = '');

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email_unique
  ON user_profiles (lower(email))
  WHERE email IS NOT NULL AND email <> '';

CREATE POLICY "Authenticated users can read profiles for evaluations"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);
