## What changes

### 1. Lovable Cloud (backend) gets enabled
Right now every account, order, and reward lives in the visitor's own browser (localStorage). To have admins, shared orders, real password resets, and a server cron, we need a real backend. I'll enable Lovable Cloud and migrate auth + data to it.

**Heads-up:** existing localStorage accounts won't carry over. Anyone who signed up previously (including you) will sign up once more with email + password. After that, `silicasurfer` and `Juannaworld` will be promoted to admin automatically on first signup, and the silicasurfer account's password will be set to `Hashguy1!`.

### 2. Database tables
- `profiles` — username, display name, phone, points
- `user_roles` — separate table (security best practice); enum `admin` / `user`; `has_role()` RPC for RLS
- `orders` — user_id, items (jsonb), total, message, address, phone, status (`pending` / `delivered` / `cancelled`), created_at
- `rewards_ledger` — user_id, points_delta, reason, created_by (admin), created_at
- `menu_cache` — single-row cache of the latest parsed menu JSON + raw text + fetched_at

### 3. Auth flow
- The "Step 2 password" gate (`Juannaw0r1d`) stays as the public verification wall.
- After the wall, the AccountGate becomes real Supabase email/password auth (sign up, sign in, "Text support to reset" button still texts 3156771426).
- When username `silicasurfer` or `Juannaworld` signs up (case-insensitive), a DB trigger inserts an `admin` row in `user_roles`.

### 4. Admin dashboard (new tab, admins only)
New route `/_authenticated/admin` (gated by `has_role(admin)` in `beforeLoad`):
- All orders table — filter by status, mark **delivered** or **cancelled**
- Per-user reward adjuster — search by phone or username, add/remove points with a reason
- Menu cache panel — see last fetch time, "Refresh now" button

The "Admin" link appears in the nav only when the signed-in user is an admin.

### 5. Interactive customer dashboard
A new `/dashboard` route (signed-in users) with tabs:
- **Menu** — same visual look as today's menu section, but rows come from the parsed Google Doc
- **My orders** — order history + status badges
- **Rewards** — current points, progress bar to 100, how it works
- **Support** — text/call buttons, password reset, message form

The current homepage stays as the marketing/landing page (hero, payments, verify, footer) so the public funnel is unchanged.

### 6. Google Doc menu sync (every 2 hours)
- Server function `fetchAndCacheMenu` pulls `https://docs.google.com/document/d/1-L_txx…/export?format=txt` (public doc, no auth needed), splits sections by `[brackets]`, splits each line by `|`, stores the structured JSON in `menu_cache`.
- A `pg_cron` job runs it every 2 hours.
- Menu page reads from `menu_cache` (instant, no live fetch on page load). Falls back to last good copy if a fetch fails.
- Admins can also click "Refresh now".

### 7. Password reset for silicasurfer → `Hashguy1!`
Done via a one-time server function called by an admin (or automatically on first deployment if the account already exists in auth.users). If silicasurfer hasn't signed up yet on the new Cloud backend, this is a no-op and the password they pick at signup is what sticks — I'll let you know which case applies after enabling.

## Technical notes
- Stack: TanStack Start + Lovable Cloud (Supabase under the hood).
- Roles use the canonical `user_roles` + `has_role()` SECURITY DEFINER pattern (never on the profile row).
- All tables get explicit `GRANT`s + RLS policies scoped to `auth.uid()`.
- Google Doc fetch + admin mutations live in `createServerFn` handlers; service-role client only loaded inside handlers.
- The menu's existing visual layout (tier cards, concentrate grid, price badges) is preserved — only the data source changes.

## Out of scope (tell me if you want any of these)
- SMS-based password reset automation (currently a "text support" button — true SMS reset needs Twilio).
- Email verification at signup (can enable later).
- Real-time order updates on the admin dashboard (will be a refresh button; can upgrade to realtime later).