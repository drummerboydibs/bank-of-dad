-- ============================================================================
-- Fix: invited co-parents got "This invite link is invalid, already used, or
-- expired" when opening the link.
--
-- The Join page calls get_invite on load, BEFORE the invitee signs in, so it
-- runs as the `anon` role. An earlier RPC-hardening migration
-- (revoke_public_execute_on_rpcs) revoked anon's EXECUTE, so the preview always
-- failed regardless of the invite's state (revoking/regenerating couldn't help).
--
-- get_invite is SECURITY DEFINER and only returns a row for an unguessable
-- token, so exposing it to anon is the intended public entry point.
-- redeem_invite is NOT granted to anon — it's only called after the invitee
-- authenticates.
-- ============================================================================

grant execute on function public.get_invite(uuid) to anon;
