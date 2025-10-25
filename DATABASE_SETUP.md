# Database Setup Guide

This guide will help you set up the Supabase database tables for the Health Symptom Matcher application.

## Prerequisites

- A Supabase account and project
- Access to your Supabase SQL Editor

## Setup Steps

### 1. Access Supabase SQL Editor

1. Go to [Supabase](https://supabase.com)
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar

### 2. Run the Database Schema

Copy the contents of `supabase-schema.sql` and paste it into the SQL Editor, then click "Run".

Alternatively, you can run the SQL commands directly from the SQL Editor:

```sql
-- Copy and paste the entire contents of supabase-schema.sql file
```

### 3. Verify Tables Were Created

After running the SQL, verify that the following tables exist:

1. **symptoms** - Main table for symptom posts
   - id (UUID)
   - user_id (UUID, references auth.users)
   - title (TEXT)
   - description (TEXT)
   - status (TEXT: 'open', 'resolved', 'see_specialist')
   - created_at, updated_at (TIMESTAMP)
   - Note: Matching is handled entirely by Gemini AI based on title and description

2. **solutions** - Table for solutions to symptom posts
   - id (UUID)
   - symptom_id (UUID, references symptoms)
   - user_id (UUID, references auth.users)
   - solution_text (TEXT)
   - helpful_count (INT)
   - created_at (TIMESTAMP)

3. **symptom_comments** - Table for comments on symptom posts
   - id (UUID)
   - symptom_id (UUID, references symptoms)
   - user_id (UUID, references auth.users)
   - comment_text (TEXT)
   - created_at (TIMESTAMP)

### 4. Verify Row Level Security (RLS)

Ensure that RLS is enabled on all tables:
- symptoms
- solutions
- symptom_comments

### 5. Test the Setup

1. Sign up for an account in your application
2. Try posting a symptom
3. Check if the data appears in the Supabase Table Editor

## Environment Variables

Make sure your `.env.local` file has the following variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env.local` file

## Troubleshooting

### Tables not appearing
- Make sure you ran the entire SQL script
- Check the SQL Editor output for any error messages
- Verify you have the correct permissions in your Supabase project

### RLS errors when querying
- Ensure RLS policies were created correctly
- Check that you're authenticated when making requests
- Verify the policies match your user_id

### Gemini API errors
- Verify your API key is correct
- Check that you have quota remaining on your Gemini API account
- Ensure the API key has the necessary permissions

## Next Steps

Once the database is set up:
1. Run `npm run dev` to start the development server
2. Sign up for an account
3. Start posting symptoms and exploring the platform!
