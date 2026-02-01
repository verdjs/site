# Fix: Active Users Counter Inconsistency

## Problem Description

Users were seeing inconsistent active user counts:
- Supabase database correctly showed 4 users
- User 1 saw count of 4
- User 2 saw count of 2
- User 3 saw count of 4
- User 4 saw count of 5

This was confusing and inaccurate.

## Root Cause Analysis

The inconsistency was caused by **race conditions in realtime updates**:

1. **Multiple Concurrent Updates**: When a user joined/left, all connected clients received a realtime event and immediately called `updateUserCount()`
2. **Cleanup Timing Issues**: The `get_active_user_count()` function runs `cleanup_stale_sessions()` before counting, which could delete sessions that were on the edge of the 1-minute timeout
3. **Race Between Insert and Count**: When User 4 registered, the realtime event could trigger before the database insert completed, causing duplicate counts or inconsistent reads
4. **No Debouncing**: Rapid-fire realtime events (INSERT, UPDATE on same session) caused multiple simultaneous count queries

### Example Scenario:
```
Time 0:00 - Users 1, 2, 3 active (last_seen = 0:00)
Time 0:55 - User 4 joins, triggers realtime event
Time 0:56 - User 1's browser queries count
          - cleanup_stale_sessions() runs
          - Sees User 2's session at 0:00 (56s old, not yet 60s)
          - User 3's heartbeat delayed
          - Might only count 2-3 users
Time 0:56 - User 4's browser queries count
          - Their own insert might not be fully committed
          - Sees 4 users + pending insert = shows 5
```

## Solution Implemented

### 1. Added Debouncing to Realtime Updates
**File**: `assets/js/backend/active-users.js`

```javascript
// New debounce timer variable
let updateCountDebounceTimer = null;

// Debounced version of updateUserCount
function debouncedUpdateUserCount(client) {
    if (updateCountDebounceTimer) {
        clearTimeout(updateCountDebounceTimer);
    }
    
    // Schedule update after 500ms of inactivity
    updateCountDebounceTimer = setTimeout(() => {
        updateUserCount(client);
        updateCountDebounceTimer = null;
    }, 500);
}
```

Now when multiple realtime events fire rapidly, only one `updateUserCount()` call executes after 500ms of quiet time.

### 2. Increased Heartbeat Frequency
**Changed**: 20 seconds → 10 seconds

```javascript
// Before
heartbeatInterval = setInterval(() => updateHeartbeat(client), 20000);

// After
heartbeatInterval = setInterval(() => updateHeartbeat(client), 10000);
```

More frequent heartbeats mean sessions stay "fresh" longer, reducing false stale detections.

### 3. Increased Session Timeout
**Changed**: 1 minute → 2 minutes

**File**: `assets/sql/setup-active-users.sql`

```sql
-- Before
WHERE last_seen < NOW() - INTERVAL '1 minute';

-- After
WHERE last_seen < NOW() - INTERVAL '2 minutes';
```

With 10s heartbeats, sessions can miss multiple heartbeats (network issues, browser throttling) without being prematurely cleaned up.

### 4. Updated Realtime Callback
**File**: `assets/js/backend/active-users.js`

```javascript
// Before
(payload) => {
    console.log('Active users change detected:', payload);
    updateUserCount(client);  // Direct call
}

// After
(payload) => {
    console.log('Active users change detected:', payload);
    debouncedUpdateUserCount(client);  // Debounced call
}
```

## Benefits of This Solution

✅ **Prevents Race Conditions**: Debouncing ensures only one count query runs even with multiple realtime events

✅ **More Stable Sessions**: 10s heartbeats + 2min timeout = sessions can survive 12 missed heartbeats before being considered stale

✅ **Consistent Counts**: All users see the same count because the count query waits for realtime events to settle

✅ **Network Resilience**: Longer timeout handles temporary network issues or browser tab throttling

✅ **Reduced Database Load**: Fewer simultaneous queries due to debouncing

## Updated Timing Parameters

| Parameter | Old Value | New Value | Reason |
|-----------|-----------|-----------|--------|
| Heartbeat Interval | 20s | 10s | More frequent updates, sessions stay fresh |
| Session Timeout | 1 minute | 2 minutes | Prevents premature cleanup, handles network issues |
| Debounce Delay | N/A | 500ms | Prevents race conditions from rapid realtime events |

### Safety Margin
- **Heartbeat**: 10s
- **Timeout**: 120s (2 minutes)
- **Buffer**: 12 heartbeats can be missed before session expires
- **Previous Buffer**: 3 heartbeats (60s / 20s)

## Expected Behavior After Fix

### Scenario: 4 Active Users
1. All 4 users' browsers register sessions
2. Each sends heartbeat every 10s
3. When User 1 queries count:
   - All 4 sessions have `last_seen` within 2 minutes
   - cleanup_stale_sessions() removes nothing
   - COUNT(*) returns 4
   - Counter displays: **4**
4. When User 5 joins:
   - Realtime event fires for all 5 clients
   - Each client's debounce timer starts
   - After 500ms, count query runs
   - All 5 sessions are in database
   - Counter displays: **5**

### Consistent Counts
Now all users should see the same count (±1 for brief moment during user join/leave before debounce settles).

## Migration Required

⚠️ **IMPORTANT**: Users need to re-run the SQL migration to update the database functions.

### Steps:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `/assets/sql/setup-active-users.sql`
3. Paste and run
4. The updated functions will replace the old ones

The SQL uses `CREATE OR REPLACE FUNCTION` so it's safe to run multiple times.

## Testing Recommendations

1. **Open 4 browser windows** (or use incognito/different browsers)
2. **Navigate to the site** in each window
3. **Observe the user count** in each window
4. **Verify all windows show the same count** (should be 4)
5. **Close one window**
6. **Verify remaining 3 windows update to 3** (after ~500ms)
7. **Wait 2+ minutes with no activity** in one window
8. **Verify that window is cleaned up** and count decreases

## Potential Edge Cases Addressed

### Page Refresh Spam
- **Problem**: User refreshing page rapidly creates multiple sessions
- **Solution**: Debouncing prevents count from jumping erratically
- **Old session cleanup**: Stale sessions removed after 2 minutes

### Browser Tab Throttling
- **Problem**: Background tabs may not run heartbeats on time
- **Solution**: 2-minute timeout allows up to 12 missed heartbeats

### Network Latency
- **Problem**: Slow network causes delayed heartbeats
- **Solution**: Debouncing waits for database to settle before counting

### Multiple Tabs Same User
- **Problem**: Each tab = separate session
- **Expected**: This is correct behavior - each tab is tracked separately
- **Note**: Not a bug, it's a feature (measures actual concurrent page views)

## Files Modified

1. `/assets/js/backend/active-users.js` - Added debouncing, updated timing
2. `/assets/sql/setup-active-users.sql` - Updated timeout from 1min to 2min
3. `/SETUP-ACTIVE-USERS.md` - Updated documentation with new timing parameters

## Backwards Compatibility

✅ **No Breaking Changes**: Existing sessions continue to work
✅ **SQL Migration Safe**: `CREATE OR REPLACE FUNCTION` updates existing functions
✅ **JavaScript Compatible**: All changes are internal, no API changes

## Conclusion

The active users counter should now display **accurate and consistent counts** across all users by:
- Preventing race conditions through debouncing
- Providing more stable session tracking with increased timeouts
- Ensuring database queries execute after realtime events settle

Users should see the same count with only brief moments of inconsistency during user joins/leaves, which resolve within 500ms.
