-- ============================================================================
-- Issue #4 — "Typing" for accounts (e.g. gift card -> brand icon).
-- https://github.com/drummerboydibs/bank-of-dad/issues/4
--
-- STATUS: DRAFT — not yet applied to the live project. See supabase/README.md.
-- NOTE: builds on 20260617120100_account_colors.sql (the view below includes
--       the `color` column added there); apply that migration first.
-- ============================================================================

alter table public.accounts
  add column if not exists account_type text not null default 'general',
  add column if not exists brand        text;

-- Constrain to a known set so the UI can rely on the value. Adjust the list as
-- new types are introduced.
alter table public.accounts
  drop constraint if exists accounts_account_type_check;
alter table public.accounts
  add  constraint accounts_account_type_check
  check (account_type in ('general', 'savings', 'spending', 'cash', 'gift_card'));

comment on column public.accounts.account_type is
  'Account kind. Drives UI affordances — e.g. gift_card reveals a brand picker.';
comment on column public.accounts.brand is
  'Optional brand key for gift_card accounts (e.g. amazon, target, visa) used to '
  'pick a brand icon. NULL for other types.';

-- Re-create the balances view with the typing columns appended after `color`.
-- Keep security_invoker = true so the view enforces the querying user's RLS.
create or replace view public.account_balances
  with (security_invoker = true) as
 SELECT a.id AS account_id,
    a.household_id,
    a.kid_user_id,
    a.name,
    COALESCE(sum(t.amount_cents), 0::numeric) AS balance_cents,
    count(t.id) AS transaction_count,
    max(t.occurred_at) AS last_activity_at,
    a.color,
    a.account_type,
    a.brand
   FROM accounts a
     LEFT JOIN transactions t ON t.account_id = a.id
  GROUP BY a.id;
