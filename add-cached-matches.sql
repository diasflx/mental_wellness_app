-- Add cached_matches column to symptoms table to store AI matching results
-- This prevents redundant Gemini API calls and ensures consistent results
ALTER TABLE symptoms
ADD COLUMN IF NOT EXISTS cached_matches JSONB DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN symptoms.cached_matches IS 'Cached JSON array of similar symptom matches from Gemini AI, includes similarity scores and reasoning';
