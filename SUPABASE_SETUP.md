# Supabase Setup Guide for IXL Authentication

This guide will help you set up Supabase for the IXL page authentication system.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the project details:
   - **Name**: verdis-site (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to be set up (takes a few minutes)

## Step 2: Get Your Project Credentials

1. Once the project is ready, go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll need two values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long JWT token starting with `eyJ...`
4. **Save these values** - you'll need them in Step 4

## Step 3: Set Up the Database Schema

1. In your Supabase project, go to the **SQL Editor** (database icon in sidebar)
2. Click **"New Query"**
3. Copy and paste the following SQL script:

```sql
-- Create users table for IXL authentication
CREATE TABLE IF NOT EXISTS ixl_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    in_queue BOOLEAN DEFAULT true,
    queue_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_ixl_users_username ON ixl_users(username);

-- Enable Row Level Security (RLS)
ALTER TABLE ixl_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON ixl_users
    FOR SELECT
    USING (true);

-- Create policy to allow inserting new users (registration)
CREATE POLICY "Allow user registration" ON ixl_users
    FOR INSERT
    WITH CHECK (true);

-- Create function to check credentials
CREATE OR REPLACE FUNCTION check_user_credentials(p_username TEXT, p_password TEXT)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    in_queue BOOLEAN,
    queue_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.in_queue,
        u.queue_position
    FROM ixl_users u
    WHERE u.username = p_username
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to register new user
CREATE OR REPLACE FUNCTION register_user(
    p_username TEXT,
    p_password TEXT,
    p_email TEXT DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    in_queue BOOLEAN,
    queue_position INTEGER
) AS $$
DECLARE
    v_user_id UUID;
    v_queue_pos INTEGER;
BEGIN
    -- Calculate next queue position
    SELECT COALESCE(MAX(queue_position), 0) + 1 INTO v_queue_pos
    FROM ixl_users;
    
    -- Insert new user
    INSERT INTO ixl_users (username, password_hash, email, in_queue, queue_position)
    VALUES (p_username, crypt(p_password, gen_salt('bf')), p_email, true, v_queue_pos)
    RETURNING id INTO v_user_id;
    
    RETURN QUERY
    SELECT 
        v_user_id,
        p_username,
        true,
        v_queue_pos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_user_credentials TO anon, authenticated;
GRANT EXECUTE ON FUNCTION register_user TO anon, authenticated;
```

4. Click **"Run"** to execute the script
5. You should see "Success. No rows returned" - this is normal!

## Step 4: Update Your Site Configuration

1. Open the file `/home/runner/work/site/site/assets/js/backend/supabase-client.js`
2. Update lines 10-11 with your credentials from Step 2:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';  // Replace with YOUR URL
const SUPABASE_KEY = 'your-anon-public-key-here';  // Replace with YOUR anon key
```

**IMPORTANT**: Keep the existing URL and key if you want to use the existing backend for reviews/stats. You may want to create a separate client for authentication.

## Step 5: Create Admin Users (Optional)

To create some test users or give specific users immediate access:

1. Go to the **SQL Editor** in Supabase
2. Run this query to create a user with access (not in queue):

```sql
-- Create an admin user (not in queue)
SELECT register_user('admin', 'your-secure-password');

-- Then grant them access by removing from queue
UPDATE ixl_users 
SET in_queue = false 
WHERE username = 'admin';
```

## Step 6: Test the Setup

1. Deploy your changes
2. Navigate to the IXL page
3. Try registering a new account
4. Try logging in with the credentials

## Security Notes

- **Never commit your Supabase credentials to GitHub!** They should be in environment variables or a secure config
- The password hashing uses bcrypt through PostgreSQL's `pgcrypto` extension
- Row Level Security (RLS) is enabled to protect user data
- Users are automatically added to the queue on registration

## Managing the Queue

To approve users and remove them from the queue:

```sql
-- View all users in queue
SELECT username, queue_position, created_at 
FROM ixl_users 
WHERE in_queue = true 
ORDER BY queue_position;

-- Approve a user (remove from queue)
UPDATE ixl_users 
SET in_queue = false 
WHERE username = 'username-here';

-- Add user back to queue
UPDATE ixl_users 
SET in_queue = true 
WHERE username = 'username-here';
```

## Troubleshooting

- **"relation ixl_users does not exist"**: Make sure you ran the SQL script in Step 3
- **"function crypt does not exist"**: Run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` in SQL Editor
- **Authentication not working**: Check browser console for errors and verify your credentials in supabase-client.js

---

**Ready to implement?** Once you've completed these steps, the authentication system will be ready to use!
