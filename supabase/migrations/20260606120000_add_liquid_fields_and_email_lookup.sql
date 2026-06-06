-- Add liquid usage fields and support evaluating users by email.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS e_liquid_ml_per_week numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nicotine_mg_per_ml numeric(10,2);

UPDATE user_profiles AS profile
SET email = auth_user.email
FROM auth.users AS auth_user
WHERE profile.user_id = auth_user.id
  AND profile.email IS NULL;

CREATE INDEX IF NOT EXISTS user_profiles_email_lower_idx
  ON user_profiles (lower(email));

CREATE OR REPLACE FUNCTION public.find_user_id_by_email(target_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(email) = lower(trim(target_email))
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.find_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(text) TO authenticated;
