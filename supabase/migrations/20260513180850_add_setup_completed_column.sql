-- Add setup_completed column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN setup_completed BOOLEAN DEFAULT FALSE;