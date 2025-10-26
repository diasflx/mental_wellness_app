-- Add username column to store user-chosen usernames
-- Used for anonymous identification in the system
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solution_votes table to track likes/dislikes
CREATE TABLE IF NOT EXISTS solution_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(solution_id, user_id) -- Each user can only vote once per solution
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for solution_votes
CREATE POLICY "Users can view all votes"
  ON solution_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON solution_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON solution_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON solution_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_solution_votes_solution_id ON solution_votes(solution_id);
CREATE INDEX idx_solution_votes_user_id ON solution_votes(user_id);

-- Add comment
COMMENT ON TABLE user_profiles IS 'Stores user-chosen usernames for anonymous identification';
COMMENT ON TABLE solution_votes IS 'Tracks user votes (likes/dislikes) on solutions';
