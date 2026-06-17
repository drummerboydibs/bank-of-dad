# Bank of Dad 🐷

A simple **family bank** web app. Parents track each kid's account balances
(Savings, Amazon gift card, …) as a tidy, date-stamped ledger. Kids can log in
to see their own balances and history — but can't change anything. Built pretty much entirely by Claude, designed by Dylan.

- **Frontend:** React + Vite + TypeScript + Tailwind (mobile-first; installable
  on an iPhone home screen).
- **Backend:** [Supabase](https://supabase.com) — Postgres, Auth, Row-Level
  Security, and one Edge Function.
- **Hosting:** GitHub Pages (static), deployed automatically by GitHub Actions.

---

## How it works

- **Parents / guardians** sign up with an email + password and manage everything
  in their household: add kids, create accounts, add/subtract money with notes,
  and invite other parents. All adults on the account are equal co-admins.
- **Kids** log in with a **username + password** (no email needed — a parent
  creates the login). They get a read-only view of their balances and history.
- Every transaction records the amount (money in = **+**, money out = **−**), a
  note, the date, and **who** made it. Reports show a **running balance** and can
  be filtered by kid, account, and date range, and searched by note or amount.

Money is stored as integer **cents** (USD) to avoid rounding errors.

---

## ⚠️ One required Supabase setting

For the smoothest experience (no email server needed), **turn off email
confirmation**:

1. Open your project at <https://supabase.com/dashboard/project/msxjsrfaciwfybbwyxhh>
2. **Authentication → Sign In / Providers → Email**
3. Turn **"Confirm email" OFF** and save.

With it off, parent signup is instant. (If you leave it on, parents must click a
confirmation link in their email before they can finish setting up — and you'll
need to configure the email **Site URL** to point at your deployed app.)

---

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (e.g. `http://localhost:5173/bank-of-dad/`).

## Build

```bash
npm run build      # type-checks and bundles into dist/
npm run preview    # serve the production build locally
```

---

## Deploy to GitHub Pages

1. Push this repo to GitHub (the default branch should be `main`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub
   Actions**.
3. That's it — every push to `main` runs `.github/workflows/deploy.yml`, which
   builds the app and publishes it to
   `https://<your-username>.github.io/bank-of-dad/`.

If you ever rename the repo or use a custom domain, update `base` in
[`vite.config.ts`](vite.config.ts) to match (it's currently `/bank-of-dad/`).

---

## Configuration

Public Supabase settings live in [`src/lib/config.ts`](src/lib/config.ts). The
URL and **publishable** key are safe to commit — the publishable key only grants
the access allowed by Row-Level Security and is meant to live in the browser.

---

## Backend reference

Supabase project ref: `msxjsrfaciwfybbwyxhh` (region `us-east-1`).

**Tables**

- `households` — one per family.
- `household_members` — links each login to a household with a role
  (`parent` / `kid`) and display name; kids also have a `username`.
- `accounts` — a kid's named balance bucket.
- `transactions` — the ledger (signed `amount_cents`, `note`, `occurred_at`,
  and the actor, set automatically by a trigger).
- `invites` — co-parent invite links.

**Views** (both use `security_invoker`, so Row-Level Security applies)

- `account_balances` — current balance + activity per account.
- `transactions_with_balance` — the ledger plus a per-account cumulative
  **running balance**, computed in SQL so date/search filters never distort it.

**Edge Function**

- `manage-kids` — privileged actions that need the service role
  (create a kid login, reset a kid's password, remove a kid). It verifies the
  caller is a parent before doing anything.

**Security**

- Row-Level Security is on for every table. Parents can read/write only within
  their own household; kids can read only their own accounts and transactions.
- Internal RLS helper functions live in a private `app` schema that isn't exposed
  through the API.

> **Note:** This project's organization is on Supabase's free plan, which allows
> 2 active projects. To make room for Bank of Dad, the older project **"Dude
> Where's My Stuff"** (`uhhbtqgaalyzxcgntmeb`) was **paused** — its data is
> preserved and it can be restored from the Supabase dashboard at any time.
