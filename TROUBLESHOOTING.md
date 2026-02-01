# Troubleshooting Guide - Active Users Tracking

## Common Errors and Solutions

### Error: "No API key found in request"

**Full error:**
```json
{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

**Causes:**
1. VerdisBackend not initialized before VerdisActiveUsers tries to use it
2. Supabase client not properly created
3. Missing or incorrect Supabase configuration

**Solutions:**

#### Solution 1: Check Browser Console
Open Developer Tools (F12) and look for these messages in order:
```
✅ "Verdis Backend Initialized"
✅ "VerdisBackend ready, initializing active users tracking"
✅ "Supabase client obtained successfully"
✅ "Session registered successfully"
```

If you see errors before these messages, that's your issue.

#### Solution 2: Verify Supabase Configuration
Check `/assets/js/backend/supabase-client.js`:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';  // Must be real URL
const SUPABASE_KEY = 'eyJhbG...';  // Must be real key
```

#### Solution 3: Check Script Load Order
In `index.html`, scripts must load in this order:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/assets/js/backend/supabase-client.js"></script>
<script src="/assets/js/backend/active-users.js"></script>
```

#### Solution 4: Hard Refresh
Clear browser cache and hard refresh:
- Chrome/Firefox: Ctrl+Shift+R
- Mac: Cmd+Shift+R

---

### Error: Table 'active_users' does not exist

**Solution:**
Run the SQL migration script:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `assets/sql/setup-active-users.sql`
3. Click Run
4. Refresh your site

---

### Error: Permission denied for table active_users

**Solution:**
The Row Level Security policies might not be set up correctly.

Re-run this part of the migration:
```sql
-- Enable RLS
ALTER TABLE public.active_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert active users"
    ON public.active_users FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can update active users"
    ON public.active_users FOR UPDATE TO anon, authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete active users"
    ON public.active_users FOR DELETE TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can read active users"
    ON public.active_users FOR SELECT TO anon, authenticated
    USING (true);
```

---

### Counter Stuck at 0

**Possible Causes:**

#### 1. Database not set up
**Check:** Run in Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM active_users;
```
If error → Run migration script

#### 2. Realtime not enabled
**Check:** 
- Go to Supabase Dashboard → Database → Replication
- Find `active_users` table
- Toggle should be ON (green)

#### 3. JavaScript not initializing
**Check Browser Console for:**
```
"Active users tracking initialized successfully"
```
If missing → Check earlier errors

---

### Counter Shows Wrong Number

**Issue:** Counter shows inflated or deflated numbers

**Solutions:**

#### Manual Cleanup
Run in Supabase SQL Editor:
```sql
-- Remove all stale sessions
SELECT cleanup_stale_sessions();

-- Check current count
SELECT get_active_user_count();

-- See all active sessions
SELECT * FROM active_users ORDER BY last_seen DESC;
```

#### Reset Everything
```sql
-- Delete all sessions and start fresh
TRUNCATE TABLE active_users;
```

Then refresh your browser.

---

### Realtime Not Working (Counter doesn't update)

**Check 1: Realtime Enabled**
- Supabase Dashboard → Database → Replication
- `active_users` must be ON

**Check 2: Subscription Status**
Browser console should show:
```
"Realtime subscription status: SUBSCRIBED"
```

If you see `"CHANNEL_ERROR"` or `"TIMED_OUT"`:
1. Check your Supabase project is not paused
2. Verify you're on a valid Supabase plan (free tier works)
3. Check Supabase status page

**Check 3: Network Issues**
Open Network tab in DevTools and look for WebSocket connections:
- Should see `wss://your-project.supabase.co/realtime/v1/websocket`
- Status should be `101 Switching Protocols`

---

### Sessions Not Cleaning Up

**Issue:** Old sessions stay in database forever

**Debug Query:**
```sql
-- See sessions older than 1 minute
SELECT * FROM active_users 
WHERE last_seen < NOW() - INTERVAL '1 minute';
```

**Solution 1: Manual Cleanup**
```sql
SELECT cleanup_stale_sessions();
```

**Solution 2: Verify Function Exists**
```sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'cleanup_stale_sessions';
```
If no results → Re-run migration script

---

### High Memory Usage / Too Many Sessions

**Issue:** Thousands of stale sessions in database

**Diagnosis:**
```sql
-- Count total sessions
SELECT COUNT(*) FROM active_users;

-- Count by age
SELECT 
    CASE 
        WHEN last_seen > NOW() - INTERVAL '1 minute' THEN 'Active'
        WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN 'Stale'
        ELSE 'Very Old'
    END as status,
    COUNT(*) as count
FROM active_users
GROUP BY status;
```

**Solution:**
```sql
-- Emergency cleanup
TRUNCATE TABLE active_users;

-- Then verify cleanup function works
SELECT cleanup_stale_sessions();
```

---

### Console Shows Many Errors

**Pattern:** Repeated errors every 20 seconds

**Cause:** Heartbeat failing because session registration failed

**Solution:**
1. Check the FIRST error in console
2. Fix that error first
3. Refresh the page
4. Heartbeat should work

---

## Debugging Checklist

Use this checklist to diagnose issues:

```
□ Supabase SDK loaded (check <script> tag in HTML)
□ VerdisBackend.init() called successfully
□ Supabase URL and Key configured correctly
□ Migration script run successfully
□ active_users table exists
□ RLS policies created
□ Realtime enabled for active_users table
□ Browser console shows "initialized successfully"
□ Network tab shows WebSocket connection
□ Session appears in database after page load
```

---

## Getting Detailed Logs

Add this to browser console for verbose logging:
```javascript
// Enable verbose Supabase logging
localStorage.setItem('supabase.debug', 'true');

// Then reload the page
location.reload();
```

---

## Still Having Issues?

1. **Check Supabase Logs:**
   - Dashboard → Logs → Realtime Logs
   - Look for connection errors

2. **Verify Database:**
   ```sql
   -- Test insert manually
   INSERT INTO active_users (session_id, last_seen)
   VALUES ('test_session', NOW());
   
   -- Test function
   SELECT get_active_user_count();
   
   -- Clean up test
   DELETE FROM active_users WHERE session_id = 'test_session';
   ```

3. **Check Browser:**
   - Try incognito/private mode
   - Try different browser
   - Check for browser extensions blocking WebSockets

4. **Verify Network:**
   - Check firewall settings
   - Check if WebSockets are allowed
   - Try from different network

---

## Quick Fixes

### Reset Everything
```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS active_users CASCADE;
-- Then re-run the full setup-active-users.sql script
```

### Disable Feature Temporarily
In `index.html`, comment out the script:
```html
<!-- <script src="/assets/js/backend/active-users.js"></script> -->
```

### Test Connection Manually
In browser console:
```javascript
// Get the client
const client = VerdisBackend.getClient();

// Test a simple query
client.from('active_users').select('*').then(console.log);
```

If this returns data, your connection works!

---

**Last Updated:** After API key error fix  
**Related Files:** SETUP-ACTIVE-USERS.md, IMPLEMENTATION-SUMMARY.md
