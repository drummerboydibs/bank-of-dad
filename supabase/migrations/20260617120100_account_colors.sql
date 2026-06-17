-- ============================================================================
-- Issue #3 — Color-code accounts on the Kids' page.
-- https://github.com/drummerboydibs/bank-of-dad/issues/3
--
-- STATUS: DRAFT — not yet applied to the live project. See supabase/README.md.
-- ============================================================================

alter table public.accounts
  add column if not exists color text;

comment on column public.accounts.color is
  'Accent color palette key for the account card (frontend maps to Tailwind '
  'classes). NULL = app default.';

-- accounts already has a parent-scoped UPDATE policy (accounts_update), so the
-- frontend can set `color` with a normal update — no RPC needed.

-- Surface the new column on the balances view the Kids' page reads. The column
-- is appended at the END so CREATE OR REPLACE VIEW stays valid (it may add
-- trailing columns but cannot rename/reorder existing ones).
create or replace view public.account_balances as
 SELECT a.id AS account_id,
    a.household_id,
    a.kid_user_id,
    a.name,
    COALESCE(sum(t.amount_cents), 0::numeric) AS balance_cents,
    count(t.id) AS transaction_count,
    max(t.occurred_at) AS last_activity_at,
    a.color
   FROM accounts a
     LEFT JOIN transactions t ON t.account_id = a.id
  GROUP BY a.id;
