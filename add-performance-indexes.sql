-- Add indexes to improve query performance
-- These indexes will speed up common queries without changing functionality

-- Symptoms table indexes
CREATE INDEX IF NOT EXISTS idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_status ON symptoms(status);
CREATE INDEX IF NOT EXISTS idx_symptoms_created_at ON symptoms(created_at DESC);

-- Solutions table indexes
CREATE INDEX IF NOT EXISTS idx_solutions_symptom_id ON solutions(symptom_id);
CREATE INDEX IF NOT EXISTS idx_solutions_user_id ON solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_solutions_created_at ON solutions(created_at DESC);

-- Solution votes indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_solution_votes_solution_id ON solution_votes(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_votes_user_id ON solution_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_solution_votes_vote_type ON solution_votes(vote_type);

-- User profiles indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_symptoms_status_created_at ON symptoms(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solution_votes_solution_vote ON solution_votes(solution_id, vote_type);

-- Analyze tables to update statistics for query planner
ANALYZE symptoms;
ANALYZE solutions;
ANALYZE solution_votes;
ANALYZE user_profiles;
