# Migration: add automatic pro re-matching

Your database already exists, so don't re-run the whole `schema.sql` —
that would fail since the tables are already there. Just run this one
new piece in Supabase's SQL Editor:

```sql
alter table bookings
  add column excluded_pro_ids uuid[] default '{}'::uuid[];
```

This is the only database change needed for the automatic re-matching
feature (when a pro declines or cancels a job, the system now tries the
next available verified pro automatically, and remembers who's already
turned the job down so it doesn't offer it to them again).

---

# Follow-up: rating-based matching + admin page

Two database changes for this one — run both in Supabase's SQL Editor:

```sql
-- 1. Table to hold who's actually allowed into /admin
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);
```

This update also adds:
- Matching now offers the job to the **highest-rated available verified
  pro first**, instead of picking whichever pro happens to come back
  first from the database.
- A `/admin` page with **real, server-checked login** (not a password
  hidden in the browser) where you can set each pro's rating and toggle
  their verification status.

## Creating your first admin account

1. Go to your live site and sign up for an account the normal way (same
   Sign Up form customers use) — use your own real email, e.g. the one
   you run the business with.
2. Go to **Supabase → Authentication → Users**, find that account, and
   copy its **User UID**.
3. Go to **Supabase → SQL Editor** and run:
   ```sql
   insert into admins (id, email) values ('paste-the-uid-here', 'your@email.com');
   ```
4. Go to `yourapp.vercel.app/admin` and log in with that same
   email/password — you're now a real, verified admin.

Anyone who signs up normally as a customer will **not** be able to reach
`/admin` — only accounts explicitly added to the `admins` table can.
