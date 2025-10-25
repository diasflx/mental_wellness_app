-- Create symptoms table (the main ticket/post table)
-- Matching is handled entirely by Gemini AI based on title and description
CREATE TABLE IF NOT EXISTS symptoms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'see_specialist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solutions table (stores the resolution/solution to a symptom post)
CREATE TABLE IF NOT EXISTS solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_text TEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table (for users to share their experiences on similar symptoms)
CREATE TABLE IF NOT EXISTS symptom_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_comments ENABLE ROW LEVEL SECURITY;

-- Policies for symptoms table
CREATE POLICY "Users can view all symptoms"
  ON symptoms FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own symptoms"
  ON symptoms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptoms"
  ON symptoms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptoms"
  ON symptoms FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for solutions table
CREATE POLICY "Users can view all solutions"
  ON solutions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert solutions"
  ON solutions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solutions"
  ON solutions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for symptom_comments table
CREATE POLICY "Users can view all comments"
  ON symptom_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert comments"
  ON symptom_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON symptom_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON symptom_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_status ON symptoms(status);
CREATE INDEX idx_symptoms_created_at ON symptoms(created_at DESC);
CREATE INDEX idx_solutions_symptom_id ON solutions(symptom_id);
CREATE INDEX idx_comments_symptom_id ON symptom_comments(symptom_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for symptoms table
CREATE TRIGGER update_symptoms_updated_at
  BEFORE UPDATE ON symptoms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
