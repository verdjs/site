# SQL Setup Required - Step-by-Step Guide

## YES, you need to run SQL to set up the database!

Without this, the counter will just show "1" (fallback mode).  
With this setup, you'll get real-time tracking.

---

## Quick Setup (3 Steps)

### Step 1: Copy the SQL Script

The SQL script is located at:
```
/assets/sql/setup-active-users.sql
```

Open that file and **copy ALL the contents** (it's about 98 lines).

### Step 2: Run in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar (database icon)
4. Click **New Query**
5. **Paste** all the SQL code you copied
6. Click **RUN** (or press Ctrl+Enter)

You should see: ✅ "Success. No rows returned"

### Step 3: Enable Realtime

1. In Supabase Dashboard, go to **Database** → **Replication** (left sidebar)
2. Find the table: `active_users`
3. Toggle the switch to **ON** (it should turn green)
4. Wait 5-10 seconds for it to activate

---

## That's It! ✅

Now when you deploy your site:
- Counter will show real-time active users
- Updates instantly when users join/leave
- Multiple browser tabs will be counted

---

## What the SQL Does

The script creates:

1. **`active_users` table** - Stores session information
   ```
   - id (UUID)
   - session_id (unique text)
   - last_seen (timestamp)
   - created_at (timestamp)
   ```

2. **Security Policies** - Allows anonymous users to manage sessions
   - Anyone can insert their session
   - Anyone can update their session
   - Anyone can delete their session
   - Anyone can read all sessions

3. **Functions**
   - `cleanup_stale_sessions()` - Deletes sessions older than 60 seconds
   - `get_active_user_count()` - Returns count of active users

4. **Indexes** - Makes queries fast
   - Index on `last_seen` for cleanup
   - Index on `session_id` for lookups

5. **Realtime Setup** - Enables live updates

---

## Verify It Worked

After running the SQL:

### Check 1: Table Exists
Run this in SQL Editor:
```sql
SELECT * FROM active_users;
```
Should return empty result (no error) ✅

### Check 2: Function Works
Run this in SQL Editor:
```sql
SELECT get_active_user_count();
```
Should return `0` ✅

### Check 3: Realtime Enabled
- Database → Replication
- `active_users` should have green toggle ✅

---

## What If You DON'T Run the SQL?

**The site will still work!** 

The counter will:
- Show "1" (current user)
- NOT track multiple users
- NOT update in real-time
- Use fallback mode

You'll see in console:
```
⚠️ "Error getting user count"
⚠️ "Showing fallback count of 1"
```

---

## Troubleshooting

### Error: "relation 'active_users' already exists"
The table is already created. You're good! Skip to Step 3 (Enable Realtime).

### Error: "permission denied"
Your Supabase user needs permissions. Try:
1. Make sure you're the project owner
2. Use the Supabase SQL Editor (not external tool)

### Error: "function already exists"
Functions already created. You're good! Skip to Step 3.

---

## Full SQL Script Location

```
📄 /assets/sql/setup-active-users.sql
```

Just copy and paste the entire file into Supabase SQL Editor and run it!

---

## Summary

✅ **Step 1:** Copy `/assets/sql/setup-active-users.sql`  
✅ **Step 2:** Paste in Supabase SQL Editor → Run  
✅ **Step 3:** Enable Realtime for `active_users` table  
✅ **Done!** Deploy your site and it will work  

**Time:** 2-3 minutes  
**Difficulty:** Easy - just copy/paste  
**Required:** Only if you want real-time tracking  

---

**Need help?** Check `QUICK-SETUP.md` or `TROUBLESHOOTING.md`
