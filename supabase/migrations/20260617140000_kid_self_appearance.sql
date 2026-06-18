-- ============================================================================
-- Issue #12 — Kids can adjust their own profile color and avatar.
-- https://github.com/drummerboydibs/bank-of-dad/issues/12
--
-- Relaxes set_member_appearance: a kid may now update their OWN row (in
-- addition to parents updating any member). Both classes are allowed to change
-- a kid's look; conflicts are left for the family to sort out.
-- ============================================================================

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
  -- A parent may restyle anyone in their household; anyone else may restyle
  -- only themselves. The UPDATE below is still household-scoped.
  if not (app.is_parent() or p_user_id = auth.uid()) then
    raise exception 'not allowed to update this member';
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

-- CREATE OR REPLACE preserves the existing ACL; re-assert the anon lockdown.
revoke execute on function public.set_member_appearance(uuid, text, text) from anon;
