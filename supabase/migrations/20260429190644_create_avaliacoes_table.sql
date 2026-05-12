/*
  # Create avaliacoes table

  1. New Tables
    - `avaliacoes`
      - `id` (uuid, primary key)
      - `id_autor` (uuid, foreign key to auth.users - who wrote the review)
      - `id_alvo` (uuid, foreign key to auth.users - who is being reviewed)
      - `nota` (integer, 1-5 scale)
      - `comentario` (text, optional comment)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `avaliacoes` table
    - Authenticated users can read all evaluations
    - Users can only insert their own evaluations (id_autor = auth.uid())
    - Users can only update/delete their own evaluations
    - A user cannot evaluate themselves (check constraint)

  3. Indexes
    - Index on id_alvo for fetching reviews of a user
    - Index on id_autor for fetching reviews by a user
    - Unique constraint to prevent duplicate evaluations (one per author per target)
*/

CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_autor uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  id_alvo uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  nota integer CHECK (nota >= 1 AND nota <= 5) NOT NULL,
  comentario text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(id_autor, id_alvo),
  CHECK (id_autor != id_alvo)
);

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read evaluations"
  ON avaliacoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own evaluations"
  ON avaliacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id_autor);

CREATE POLICY "Users can update own evaluations"
  ON avaliacoes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id_autor)
  WITH CHECK (auth.uid() = id_autor);

CREATE POLICY "Users can delete own evaluations"
  ON avaliacoes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id_autor);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_id_alvo ON avaliacoes(id_alvo);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_id_autor ON avaliacoes(id_autor);