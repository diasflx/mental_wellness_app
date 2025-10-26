-- Verify user_profiles table exists and check its structure
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Check if there are any rows
SELECT COUNT(*) as row_count FROM user_profiles;

-- Try to select all rows (to verify RLS policies work)
SELECT * FROM user_profiles LIMIT 5;
