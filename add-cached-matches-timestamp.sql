-- Add cached_matches_updated_at column to symptoms table
-- This tracks when the cached matches were last updated to enable automatic re-checking
ALTER TABLE symptoms
ADD COLUMN IF NOT EXISTS cached_matches_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN symptoms.cached_matches_updated_at IS 'Timestamp when cached_matches was last updated. Used to invalidate old caches (> 24 hours) and re-check for new matching posts';

-- Add index for efficient queries on cache age
CREATE INDEX IF NOT EXISTS idx_symptoms_cached_matches_updated_at ON symptoms(cached_matches_updated_at);
