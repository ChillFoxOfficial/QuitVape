-- Fix admin_delete_user: garante que apaga de user_profiles mesmo que
-- auth.users não possa ser apagado diretamente via SQL.
-- A deleção de auth.users deve ser feita pela Edge Function admin-delete-user.

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

  -- Tentar obter o email de auth.users
  SELECT lower(email)
  INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  -- Se não estiver em auth.users, tentar em user_profiles
  IF target_email IS NULL THEN
    SELECT lower(email)
    INTO target_email
    FROM public.user_profiles
    WHERE user_id = target_user_id;
  END IF;

  -- Proteger contas admin
  IF target_email IS NOT NULL AND EXISTS (
    SELECT 1
    FROM admin_emails
    WHERE lower(email) = target_email
  ) THEN
    RAISE EXCEPTION 'Não é permitido apagar contas admin';
  END IF;

  -- Apagar de user_profiles (sempre funciona)
  DELETE FROM public.user_profiles
  WHERE user_id = target_user_id;

  -- Tentar apagar de auth.users (pode falhar conforme permissões do Supabase)
  -- Se falhar, a Edge Function admin-delete-user trata disto via service_role
  BEGIN
    DELETE FROM auth.users
    WHERE id = target_user_id;
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erro aqui; a Edge Function vai completar a deleção
    NULL;
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
