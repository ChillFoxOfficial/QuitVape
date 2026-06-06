-- Allow admins to delete user accounts from auth.users (cascades to related data).
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_email text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não podes apagar a tua própria conta';
  END IF;

  SELECT lower(email)
  INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'Utilizador não encontrado';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM admin_emails
    WHERE lower(email) = target_email
  ) THEN
    RAISE EXCEPTION 'Não é permitido apagar contas admin';
  END IF;

  DELETE FROM auth.users
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
