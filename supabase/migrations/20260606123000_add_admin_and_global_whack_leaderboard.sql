-- Admin access and global Whack-a-Vape leaderboard.
CREATE TABLE IF NOT EXISTS admin_emails (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

INSERT INTO admin_emails (email)
VALUES ('admin@quitvape.pt')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_emails
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS whack_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  score integer CHECK (score >= 0) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE whack_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read whack scores"
  ON whack_scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own whack scores"
  ON whack_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete whack scores"
  ON whack_scores
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_whack_scores_score_created_at
  ON whack_scores (score DESC, created_at ASC);

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  name text,
  setup_completed boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    profile.user_id,
    coalesce(profile.email, auth_user.email) AS email,
    profile.name,
    profile.setup_completed,
    profile.created_at
  FROM user_profiles AS profile
  LEFT JOIN auth.users AS auth_user ON auth_user.id = profile.user_id
  WHERE public.is_admin()
  ORDER BY profile.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.admin_list_avaliacoes()
RETURNS TABLE (
  id uuid,
  id_autor uuid,
  autor_nome text,
  autor_email text,
  id_alvo uuid,
  alvo_nome text,
  alvo_email text,
  nota integer,
  comentario text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    av.id,
    av.id_autor,
    autor.name AS autor_nome,
    coalesce(autor.email, autor_auth.email) AS autor_email,
    av.id_alvo,
    alvo.name AS alvo_nome,
    coalesce(alvo.email, alvo_auth.email) AS alvo_email,
    av.nota,
    av.comentario,
    av.created_at
  FROM avaliacoes AS av
  LEFT JOIN user_profiles AS autor ON autor.user_id = av.id_autor
  LEFT JOIN user_profiles AS alvo ON alvo.user_id = av.id_alvo
  LEFT JOIN auth.users AS autor_auth ON autor_auth.id = av.id_autor
  LEFT JOIN auth.users AS alvo_auth ON alvo_auth.id = av.id_alvo
  WHERE public.is_admin()
  ORDER BY av.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.admin_list_whack_scores()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  player_name text,
  user_email text,
  score integer,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    score.id,
    score.user_id,
    score.player_name,
    coalesce(profile.email, auth_user.email) AS user_email,
    score.score,
    score.created_at
  FROM whack_scores AS score
  LEFT JOIN user_profiles AS profile ON profile.user_id = score.user_id
  LEFT JOIN auth.users AS auth_user ON auth_user.id = score.user_id
  WHERE public.is_admin()
  ORDER BY score.score DESC, score.created_at ASC
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_avaliacao(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM avaliacoes
  WHERE id = target_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_whack_score(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM whack_scores
  WHERE id = target_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_avaliacoes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_whack_scores() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_avaliacao(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_whack_score(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_avaliacoes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_whack_scores() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_avaliacao(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_whack_score(uuid) TO authenticated;
