-- Complete setup for user_profiles and solution_votes tables
-- Run this if you're getting "column username does not exist" errors

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS solution_votes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solution_votes table
CREATE TABLE solution_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(solution_id, user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for solution_votes
CREATE POLICY "Users can view all votes"
  ON solution_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON solution_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON solution_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON solution_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_solution_votes_solution_id ON solution_votes(solution_id);
CREATE INDEX idx_solution_votes_user_id ON solution_votes(user_id);

-- Add comments
COMMENT ON TABLE user_profiles IS 'Stores user-chosen usernames for anonymous identification';
COMMENT ON COLUMN user_profiles.username IS 'Unique username chosen by user (lowercase alphanumeric, 3-20 chars)';
COMMENT ON TABLE solution_votes IS 'Tracks user votes (likes/dislikes) on solutions';
