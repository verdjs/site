-- =====================================================
-- Verdis Active Users Tracking - Supabase Setup
-- =====================================================
-- 
-- ⚠️ IMPORTANT: YOU MUST RUN THIS SQL SCRIPT! ⚠️
-- 
-- Without this, the active users counter will only show "1" (fallback).
-- With this setup, you'll get real-time tracking of all active users.
-- 
-- HOW TO RUN:
-- 1. Copy this ENTIRE file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and click RUN
-- 4. Then enable Realtime: Database → Replication → Toggle ON for 'active_users'
-- 
-- See: SQL-SETUP-REQUIRED.md for detailed instructions
-- =====================================================

-- 1. Create the active_users table for presence tracking
CREATE TABLE IF NOT EXISTS public.active_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.active_users ENABLE ROW LEVEL Security;

-- 3. Create policies to allow public read/write access
-- Policy for inserting new sessions
CREATE POLICY "Anyone can insert active users"
    ON public.active_users
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy for updating their own session
CREATE POLICY "Anyone can update active users"
    ON public.active_users
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for deleting expired sessions
CREATE POLICY "Anyone can delete active users"
    ON public.active_users
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- Policy for reading all active users
CREATE POLICY "Anyone can read active users"
    ON public.active_users
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 4. Create a function to clean up stale sessions (older than 1 minute)
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.active_users
    WHERE last_seen < NOW() - INTERVAL '1 minute';
END;
$$;

-- 5. Create a function to get current active user count
CREATE OR REPLACE FUNCTION public.get_active_user_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- First cleanup stale sessions
    PERFORM public.cleanup_stale_sessions();
    
    -- Then count active users
    SELECT COUNT(*) INTO user_count
    FROM public.active_users
    WHERE last_seen > NOW() - INTERVAL '1 minute';
    
    RETURN user_count;
END;
$$;

-- 6. Enable realtime for the active_users table
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_users;

-- 7. Create an index for faster queries on last_seen
CREATE INDEX IF NOT EXISTS idx_active_users_last_seen 
    ON public.active_users(last_seen DESC);

-- 8. Create an index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_active_users_session_id 
    ON public.active_users(session_id);

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Next steps:
-- 1. Go to Database > Replication in Supabase Dashboard
-- 2. Enable replication for the 'active_users' table
-- 3. Your application can now track active users in real-time!
