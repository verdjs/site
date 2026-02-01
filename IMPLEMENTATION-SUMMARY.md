# Active Users Implementation Summary

## What Was Changed

### 1. New Files Created

#### `/assets/sql/setup-active-users.sql`
- SQL migration script for setting up the database
- Creates `active_users` table for tracking sessions
- Implements PostgreSQL functions for cleanup and counting
- Sets up Row Level Security policies
- Enables Supabase Realtime on the table

#### `/assets/js/backend/active-users.js`
- New JavaScript module for client-side presence tracking
- Manages user session lifecycle (register, heartbeat, cleanup)
- Subscribes to Supabase Realtime for instant updates
- Updates the UI counter when users join/leave

#### `/SETUP-ACTIVE-USERS.md`
- Comprehensive setup guide for administrators
- Step-by-step instructions for database setup
- Troubleshooting tips and customization options

### 2. Modified Files

#### `/assets/js/backend/supabase-client.js`
- **Added**: `getClient()` method to expose the Supabase client
- This allows other modules to access the client for advanced features

#### `/index.html`
- **Added**: Script import for `active-users.js`
- **Removed**: Old `getActiveUsers()` function (broken API call)
- **Removed**: Polling interval for external API
- **Added**: Comments explaining the new approach

## Key Features

### Real-Time Updates
- Uses Supabase Realtime subscriptions
- Updates instantly when users join or leave
- No polling required - event-driven architecture

### Automatic Cleanup
- Sessions expire after 60 seconds of inactivity
- Database cleanup runs automatically with each count query
- No manual intervention needed

### Reliable Session Management
- Each browser session gets a unique ID
- Heartbeat every 20 seconds keeps sessions alive
- Cleanup on page unload removes sessions immediately

### Performance
- Database indexes for fast queries
- Efficient Realtime subscriptions
- Minimal overhead on free tier

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Website                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  VerdisActiveUsers.init() - Generate session_id             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  INSERT session into active_users table                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Subscribe to Realtime changes on active_users              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Every 20s: UPDATE last_seen timestamp (heartbeat)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  On ANY change to table: get_active_user_count()            │
│  - Cleanup stale sessions (>60s old)                        │
│  - COUNT remaining sessions                                 │
│  - Update UI counter                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  User Leaves: DELETE session from active_users              │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

```sql
Table: public.active_users
┌──────────────┬───────────────────────────┬──────────────────────┐
│ Column       │ Type                      │ Default              │
├──────────────┼───────────────────────────┼──────────────────────┤
│ id           │ UUID                      │ gen_random_uuid()    │
│ session_id   │ TEXT (UNIQUE)             │ NOT NULL             │
│ last_seen    │ TIMESTAMP WITH TIME ZONE  │ NOW()                │
│ created_at   │ TIMESTAMP WITH TIME ZONE  │ NOW()                │
└──────────────┴───────────────────────────┴──────────────────────┘

Indexes:
- PRIMARY KEY on id
- INDEX on last_seen (for cleanup performance)
- INDEX on session_id (for updates/deletes)
```

## Before vs After

### Before (Broken)
```javascript
// Polled external API every 30 seconds
async function getActiveUsers() {
    const res = await fetch("https://api.x8r.dev/api/umami");
    const data = await res.json();
    document.getElementById("user-count").textContent = data.visitors;
}
setInterval(() => getActiveUsers(), 30000);
```

**Problems**:
- ❌ Dependent on external API (single point of failure)
- ❌ 30-second delay before updates
- ❌ No real-time updates
- ❌ Currently broken/not working

### After (Supabase)
```javascript
// Real-time Supabase subscription
VerdisActiveUsers.init();
// Automatically:
// - Registers this user's session
// - Subscribes to real-time updates
// - Updates counter instantly when users join/leave
// - Sends heartbeat every 20s
// - Cleans up on page close
```

**Benefits**:
- ✅ Self-hosted on Supabase (no external dependencies)
- ✅ Real-time updates (< 1 second latency)
- ✅ Automatic session management
- ✅ Reliable and scalable

## Testing the Implementation

### Local Testing (Before Database Setup)
The code will gracefully handle missing database setup:
```
Console: "VerdisBackend not configured. Active users tracking disabled."
Counter shows: 0
```

### After Database Setup
1. Open the site in multiple browser tabs/windows
2. Counter should increment for each new tab
3. Close a tab → counter decrements within 1-2 seconds
4. Leave a tab idle for >60s → counter decrements automatically

### Verification Queries

```sql
-- See all active sessions
SELECT * FROM public.active_users;

-- Get current count
SELECT public.get_active_user_count();

-- Manually trigger cleanup
SELECT public.cleanup_stale_sessions();
```

## Maintenance

### Zero Maintenance Required
- Sessions auto-cleanup after 60 seconds
- No cron jobs or scheduled tasks needed
- Cleanup runs automatically on each count query
- Database remains small and fast

### Optional Optimizations

If you get millions of sessions per day, you could:
1. Add a PostgreSQL scheduled job (pg_cron) to cleanup periodically
2. Adjust the session timeout to be shorter
3. Increase the heartbeat interval to reduce write load

But for normal traffic, the default setup is perfect.

---

## Migration Guide for Administrators

1. **Run SQL Migration**
   - Copy `/assets/sql/setup-active-users.sql`
   - Paste into Supabase SQL Editor
   - Click Run

2. **Enable Realtime**
   - Go to Database → Replication
   - Enable `active_users` table

3. **Deploy Code**
   - Push the updated code to your server
   - The feature will activate automatically

4. **Verify**
   - Open the site
   - Check browser console for: "Active users tracking initialized successfully"
   - Counter should show 1 (or more if multiple users)

That's it! 🎉

---

**Files Modified**: 2  
**Files Created**: 3  
**Lines Added**: ~470  
**Lines Removed**: ~20  
**External Dependencies**: 0 (uses existing Supabase)
