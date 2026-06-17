# Supabase migrations

The live `bank-of-dad` project (ref `msxjsrfaciwfybbwyxhh`) was originally
provisioned through the Supabase MCP. Its applied history is:

| version          | name                            |
| ---------------- | ------------------------------- |
| 20260617060148   | initial_schema                  |
| 20260617060533   | harden_security_definer_helpers |
| 20260617060646   | revoke_public_execute_on_rpcs   |

## Draft migrations (NOT yet applied)

These were written for review and are **not** applied to the live project. They
back the three schema-changing enhancement issues:

| file                                    | issue | what it adds                                                        |
| --------------------------------------- | ----- | ------------------------------------------------------------------- |
| `20260617120000_kid_avatars_colors.sql` | #2    | `household_members.color` + `.avatar`, and a `set_member_appearance` RPC |
| `20260617120100_account_colors.sql`     | #3    | `accounts.color`; exposes it on the `account_balances` view         |
| `20260617120200_account_typing.sql`     | #4    | `accounts.account_type` + `.brand`; exposes them on the view        |

### Notes / review points

- **Apply in order.** `#4` recreates `account_balances` including the `color`
  column from `#3`, so `#3` must be applied first.
- **#2 uses an RPC, not a direct update.** `household_members` has only a SELECT
  RLS policy; all writes go through SECURITY DEFINER functions. The new
  `set_member_appearance(p_user_id, p_color, p_avatar)` updates only the two
  appearance columns and only within the caller's household. (#3/#4 need no RPC
  because `accounts` already has a parent-scoped UPDATE policy.)
- **Palette/brand values are app-owned.** `color` and `brand` are free text; the
  set of valid keys lives in the frontend. `account_type` is constrained by a DB
  CHECK because the UI branches on it.

### After applying

1. Regenerate types into `src/lib/database.types.ts`
   (`generate_typescript_types` MCP tool, or `supabase gen types`).
2. Build the matching frontend (avatar/color pickers on Family + KidDetail,
   account color/type pickers on KidDetail) — deferred until the schema lands.
