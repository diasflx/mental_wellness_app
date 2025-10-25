# Mental Wellness Hub - Setup Guide

## Quick Start

The app is now running with enhanced features including:
- User authentication (Login/Signup)
- Improved text visibility in input fields
- User profile with statistics
- Enhanced UI/UX

## Setting Up Supabase Authentication

To enable full authentication functionality, you need to set up a Supabase project:

### Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon/public** key (a long string starting with `eyJ...`)

### Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here
```

3. Save the file and restart your development server

### Step 4: Configure Email Authentication in Supabase

1. In your Supabase project, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional) in **Authentication** > **Email Templates**

### Step 5: Test Your Authentication

1. Restart your development server if it's running
2. Open [http://localhost:3001](http://localhost:3001)
3. Try signing up with an email and password
4. Check your email for a confirmation link (if email confirmation is enabled)
5. Log in with your credentials

## Features

### Current Features
- ✅ User Authentication (Sign up, Login, Logout)
- ✅ Mood Tracker with emoji selection and notes
- ✅ Daily Journal with prompts and search
- ✅ Breathing Exercises (guided meditation)
- ✅ User Profile with statistics
- ✅ Improved text visibility in all input fields
- ✅ Mental health resources and crisis support info

### Authentication Features
- Email/Password authentication
- Secure session management
- User profile with stats
- Personalized greetings
- Protected routes

## Future Database Features (Coming Soon)

Currently, the app uses localStorage for storing mood and journal entries. To fully utilize Supabase:

### Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Mood entries table
CREATE TABLE mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_value INTEGER NOT NULL,
  mood_label TEXT NOT NULL,
  mood_emoji TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for mood entries
CREATE POLICY "Users can view their own mood entries"
  ON mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
  ON mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Journal entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for journal entries
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);
```

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"
- Run `npm install` to ensure all dependencies are installed

### Issue: App shows connection errors
- Check that your `.env.local` file has the correct Supabase credentials
- Make sure you've replaced the placeholder values
- Restart your development server after updating environment variables

### Issue: Email confirmation required
- Check your Supabase project settings under **Authentication** > **Settings**
- You can disable email confirmation for development by toggling "Enable email confirmations"

### Issue: Can't log in after signing up
- Check your email for a confirmation link
- Or disable email confirmation in Supabase settings for testing

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel

## Support

Remember: This app is for wellness support and is not a substitute for professional mental health care.

If you're in crisis:
- Call 988 (Suicide & Crisis Lifeline)
- Text HOME to 741741 (Crisis Text Line)
