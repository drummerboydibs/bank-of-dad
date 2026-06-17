-- ============================================================================
-- Issue #2 — Per-member avatars (emoji) and selectable accent colors.
-- https://github.com/drummerboydibs/bank-of-dad/issues/2
--
-- STATUS: DRAFT — not yet applied to the live project. See supabase/README.md.
-- ============================================================================

alter table public.household_members
  add column if not exists color  text,
  add column if not exists avatar text;

comment on column public.household_members.color is
  'Accent color palette key (e.g. green, sky, rose). NULL = app default. The '
  'frontend maps the key to Tailwind classes; the set of keys lives in the app.';
comment on column public.household_members.avatar is
  'Optional emoji shown as the member''s avatar. NULL = fall back to initials '
  'rendered inside a circle tinted with the member''s color.';

-- household_members is locked down: it has ONLY a SELECT RLS policy, and every
-- write goes through a SECURITY DEFINER function (parents are created by
-- setup_parent_account / redeem_invite, kids by the manage-kids Edge Function).
--
-- Rather than open a broad UPDATE policy on the table — which Postgres RLS
-- cannot scope to specific columns, so it would also expose `role` and
-- `user_id` to tampering — expose a narrow RPC that updates ONLY the two
-- appearance columns, and only for a member in the caller's own household.
create or replace function public.set_member_appearance(
  p_user_id uuid,
  p_color   text,
  p_avatar  text
) returns void
language plpgsql
security definer
set search_path = public, app
as $$
begin
  if not app.is_parent() then
    raise exception 'only parents can update member appearance';
  end if;

  update public.household_members
     set color  = p_color,
         avatar = p_avatar
   where user_id      = p_user_id
     and household_id = app.current_household_id();

  if not found then
    raise exception 'member not found in your household';
  end if;
end;
$$;

-- Mirror the project's RPC hardening: no implicit public execute, only
-- authenticated callers (the body still enforces the parent + household check).
revoke all     on function public.set_member_appearance(uuid, text, text) from public;
grant  execute on function public.set_member_appearance(uuid, text, text) to authenticated;
