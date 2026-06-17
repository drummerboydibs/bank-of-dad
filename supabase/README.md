# Supabase migrations

The live `bank-of-dad` project (ref `msxjsrfaciwfybbwyxhh`) was originally
provisioned through the Supabase MCP. Its applied history is:

| version          | name                            |
| ---------------- | ------------------------------- |
| 20260617060148   | initial_schema                  |
| 20260617060533   | harden_security_definer_helpers |
| 20260617060646   | revoke_public_execute_on_rpcs   |

## Applied migrations for #2–#4

These back the three schema-changing enhancement issues and **have been applied**
to the live project (the live history also includes a follow-up
`restore_account_balances_security_invoker` migration, whose fix is folded into
the view definitions below):

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
- **`account_balances` must keep `security_invoker = true`.** `CREATE OR REPLACE
  VIEW` silently drops view options, so each recreation re-declares it.
  Without it the view runs as owner and bypasses RLS, leaking every household's
  balances — the Supabase security linter flags this as an ERROR.

### Already done

1. Types regenerated into `src/lib/database.types.ts`.
2. Frontend built: per-kid color/emoji on Family + KidDetail; account color and
   type/brand pickers on KidDetail.
