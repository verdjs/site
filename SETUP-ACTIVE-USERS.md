# Real-Time Active Users Setup Guide

This guide explains how to set up real-time active user tracking using Supabase for the Verdis site.

## Overview

The active users feature tracks and displays the number of users currently on your site in real-time. It uses:
- **Supabase Database**: Stores active user sessions with automatic cleanup of stale sessions
- **Supabase Realtime**: Provides instant updates when users join or leave
- **PostgreSQL Functions**: Handle session cleanup and counting logic

## Prerequisites

- A Supabase account (free tier works fine)
- Your Supabase project URL and anon key already configured in `/assets/js/backend/supabase-client.js`

## Setup Instructions

### Step 1: Run the SQL Migration

1. Log in to your Supabase Dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the entire contents of `/assets/sql/setup-active-users.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

This will:
- ✅ Create the `active_users` table
- ✅ Set up Row Level Security policies
- ✅ Create PostgreSQL functions for cleanup and counting
- ✅ Add database indexes for performance
- ✅ Enable realtime on the table

### Step 2: Enable Realtime Replication

1. In your Supabase Dashboard, go to **Database** → **Replication**
2. Find the `active_users` table in the list
3. Toggle the switch to **enable** replication for this table
4. Wait a few seconds for the change to propagate

### Step 3: Verify the Setup

1. Go back to **SQL Editor**
2. Run this test query:
   ```sql
   SELECT * FROM public.active_users;
   ```
   You should see an empty table (or sessions if the site is already running)

3. Test the function:
   ```sql
   SELECT public.get_active_user_count();
   ```
   This should return `0` (or the current count if users are active)

### Step 4: Deploy the Code

The code changes have already been made to:
- `/assets/js/backend/supabase-client.js` - Added `getClient()` method
- `/assets/js/backend/active-users.js` - New module for tracking active users
- `/index.html` - Included the new module and removed old broken code

Simply deploy your updated site, and the active users counter should start working!

## How It Works

### User Session Tracking

1. **On Page Load**: Each visitor gets a unique session ID
2. **Registration**: Session is registered in the `active_users` table
3. **Heartbeat**: Every 20 seconds, the session updates its `last_seen` timestamp
4. **Cleanup**: Sessions older than 1 minute are automatically removed
5. **Real-time Updates**: The counter updates instantly when users join/leave

### Session Lifecycle

```
User arrives → Generate session_id → Insert into active_users
     ↓
Every 20s → Update last_seen timestamp
     ↓
User leaves → Delete session from active_users
     ↓
(or session expires after 60s of inactivity)
```

### Realtime Subscription

The site subscribes to changes on the `active_users` table:
- When a user joins (INSERT) → Counter updates
- When a heartbeat occurs (UPDATE) → Counter stays accurate
- When a user leaves (DELETE) → Counter decrements

## Customization

### Adjust Session Timeout

To change how long before a session is considered inactive, edit the SQL:

```sql
-- In setup-active-users.sql, line 65
WHERE last_seen < NOW() - INTERVAL '1 minute';  -- Change '1 minute' to your preference
```

### Adjust Heartbeat Interval

To change how often sessions update, edit the JavaScript:

```javascript
// In active-users.js, line 42
heartbeatInterval = setInterval(() => updateHeartbeat(client), 20000); // 20000ms = 20s
```

**Note**: Keep heartbeat interval < session timeout for accurate tracking.

## Troubleshooting

### Counter shows 0 or doesn't update

1. **Check Console**: Open browser DevTools (F12) and look for errors
2. **Verify Supabase Config**: Make sure URL and key are set in `supabase-client.js`
3. **Check Realtime**: Ensure replication is enabled in Supabase Dashboard
4. **Verify RLS Policies**: Run the SQL migration again to ensure policies are set

### Sessions not cleaning up

1. Run this in SQL Editor to manually clean up:
   ```sql
   SELECT public.cleanup_stale_sessions();
   ```
2. Check that the function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'cleanup_stale_sessions';
   ```

### High session count (inflated numbers)

This can happen if:
- Users refresh the page frequently (creates new sessions)
- Cleanup isn't running properly
- Multiple tabs from same user (each tab = separate session)

To reset all sessions:
```sql
TRUNCATE TABLE public.active_users;
```

## Security Notes

- The `active_users` table uses Row Level Security (RLS)
- Anonymous users can read/write their own sessions
- No sensitive user data is stored (just session IDs and timestamps)
- Sessions automatically expire after 1 minute of inactivity

## Performance Considerations

- The `active_users` table is indexed for fast queries
- Realtime subscriptions are efficient for this use case
- The cleanup function runs on every count query to keep the table small
- Supabase free tier handles thousands of concurrent users easily

## Additional Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)

---

**That's it!** Your site now has real-time active user tracking powered by Supabase. 🎉
