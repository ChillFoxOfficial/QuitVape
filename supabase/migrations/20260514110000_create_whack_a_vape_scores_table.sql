/*
  # Create Whack-a-Vape scores table

  1. New Tables
    - `whack_a_vape_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, foreign key to auth.users)
      - `player_name` (text)
      - `score` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Authenticated users can read the leaderboard
    - Users can insert and update only their own score
*/

CREATE TABLE IF NOT EXISTS whack_a_vape_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  player_name text NOT NULL DEFAULT 'Jogador',
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE whack_a_vape_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read Whack-a-Vape scores"
  ON whack_a_vape_scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own Whack-a-Vape score"
  ON whack_a_vape_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Whack-a-Vape score"
  ON whack_a_vape_scores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_whack_a_vape_scores_score
  ON whack_a_vape_scores(score DESC, updated_at ASC);
