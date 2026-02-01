# 🚀 Quick Setup Guide - Active Users Tracking

## ⚡ 3-Minute Setup

### Step 1️⃣: Run SQL (1 min)
1. Open [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy & paste entire contents of: `/assets/sql/setup-active-users.sql`
5. Click **Run** ▶️

### Step 2️⃣: Enable Realtime (1 min)
1. Go to **Database** → **Replication** (left sidebar)
2. Find `active_users` in the table list
3. Toggle switch to **ON** 🟢
4. Wait 5 seconds

### Step 3️⃣: Deploy & Test (1 min)
1. Deploy your code (the changes are already in this PR!)
2. Open your site
3. Open browser console (F12)
4. Look for: ✅ `"Active users tracking initialized successfully"`
5. Check navbar counter - should show **1** (or more)

## ✅ Verification

Open 3 browser tabs:
- Tab 1: Counter shows **1**
- Tab 2: Counter shows **2** 
- Tab 3: Counter shows **3** ✨
- Close Tab 3: Counter shows **2**

## 📋 What You Get

- ✨ **Real-time** active user count in navbar
- 🔄 Updates **instantly** (< 1 second)
- 🧹 **Auto-cleanup** of stale sessions
- 📊 **No maintenance** required
- 🆓 **Free tier** compatible

## 🔧 Files Overview

| File | Purpose |
|------|---------|
| `assets/sql/setup-active-users.sql` | Database setup script |
| `assets/js/backend/active-users.js` | Client-side tracking logic |
| `assets/js/backend/supabase-client.js` | Exposes Supabase client |
| `index.html` | Includes new script, removes old code |

## 🐛 Troubleshooting

**Counter stuck at 0?**
- Check browser console for errors
- Verify Supabase URL/Key in `supabase-client.js`
- Ensure Realtime is enabled in Supabase Dashboard

**Counter not updating?**
- Check: Database → Replication → `active_users` is **ON**
- Re-run the SQL migration script
- Hard refresh your browser (Ctrl+Shift+R)

**Need help?**
- Full guide: `SETUP-ACTIVE-USERS.md`
- Technical details: `IMPLEMENTATION-SUMMARY.md`

---

**That's it!** 3 steps, 3 minutes, real-time active users. 🎉

Made with ❤️ for Verdis
