-- Migration: Remove symptoms_keywords column
-- This migration removes the symptoms_keywords column from the symptoms table
-- since matching is now handled entirely by Gemini AI based on title and description

-- Drop the symptoms_keywords column if it exists
ALTER TABLE symptoms DROP COLUMN IF EXISTS symptoms_keywords;

-- Verification query (run this after migration to confirm)
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'symptoms';
