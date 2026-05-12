/*
  # Add Cravings and Badges Tables

  1. New Tables
    - `cravings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `intensity` (integer, 1-5 scale)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      
    - `user_badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `badge_type` (text, e.g., 'first_day', 'week_one', 'month_one')
      - `unlocked_at` (timestamp)
      - `days_achieved` (integer)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    
  3. Indexes
    - Add index on user_id for both tables for faster queries
    - Add index on created_at for cravings to support time-based queries
*/

-- Create cravings table
CREATE TABLE IF NOT EXISTS cravings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  intensity integer CHECK (intensity >= 1 AND intensity <= 5) DEFAULT 3,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  days_achieved integer NOT NULL,
  UNIQUE(user_id, badge_type)
);

-- Enable RLS
ALTER TABLE cravings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Cravings policies
CREATE POLICY "Users can read own cravings"
  ON cravings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cravings"
  ON cravings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cravings"
  ON cravings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cravings"
  ON cravings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can read own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cravings_user_id ON cravings(user_id);
CREATE INDEX IF NOT EXISTS idx_cravings_created_at ON cravings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
