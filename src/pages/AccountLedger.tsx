import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { TextField } from "../components/form";
import { Alert, EmptyState, Money, Spinner } from "../components/ui";
import { formatCents, parseDollarsToCents } from "../lib/money";
import { formatDate, todayInputValue } from "../lib/format";

interface AccountInfo {
  name: string;
  balance_cents: number;
}
interface LedgerRow {
  id: string;
  amount_cents: number;
  note: string | null;
  occurred_at: string;
  created_by_name: string | null;
  running_balance_cents: number;
}

export default function AccountLedger() {
  const { accountId = "" } = useParams();
  const { role } = useAuth();
  const isParent = role === "parent";
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: acc }, { data: tx }] = await Promise.all([
      supabase
        .from("account_balances")
        .select("name, balance_cents")
        .eq("account_id", accountId)
        .maybeSingle(),
      supabase
        .from("transactions_with_balance")
        .select("id, amount_cents, note, occurred_at, created_by_name, running_balance_cents")
        .eq("account_id", accountId)
        .order("occurred_at", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);
    setAccount((acc as AccountInfo) ?? null);
    setRows((tx ?? []) as LedgerRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  if (loading)
    return (
      <div className="flex justify-center py-10 text-green-700">
        <Spinner className="h-7 w-7" />
      </div>
    );
  if (!account)
    return (
      <EmptyState title="Account not found">
        <Link to="/app" className="text-green-700">
          Back to home
        </Link>
      </EmptyState>
    );

  return (
    <div className="space-y-4">
      <Link to="/app" className="text-sm text-slate-500">
        ← Home
      </Link>

      <div className="card text-center">
        <p className="text-sm text-slate-500">{account.name}</p>
        <Money cents={account.balance_cents} className="text-3xl font-bold" />
      </div>

      {isParent && <AddMoneyForm accountId={accountId} onAdded={load} />}

      <h2 className="font-semibold">History</h2>
      {rows.length === 0 ? (
        <EmptyState title="No transactions yet">
          {isParent ? "Add money above to get started." : "Nothing here yet."}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {r.note || (r.amount_cents >= 0 ? "Deposit" : "Withdrawal")}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(r.occurred_at)}
                  {r.created_by_name ? ` · by ${r.created_by_name}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <Money cents={r.amount_cents} signed className="font-semibold" />
                <p className="text-xs text-slate-500">bal {formatCents(r.running_balance_cents)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddMoneyForm({ accountId, onAdded }: { accountId: string; onAdded: () => void }) {
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const cents = parseDollarsToCents(amount);
    if (cents === null || cents === 0) {
      setError("Enter an amount greater than $0.");
      return;
    }
    setBusy(true);
    const signed = direction === "in" ? cents : -cents;
    // Anchor at local noon so the calendar date never shifts across time zones.
    const occurredAt = new Date(`${date}T12:00:00`).toISOString();
    const { error } = await supabase.from("transactions").insert({
      account_id: accountId,
      amount_cents: signed,
      note: note.trim() || null,
      occurred_at: occurredAt,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setAmount("");
    setNote("");
    setDirection("in");
    setDate(todayInputValue());
    onAdded();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={direction === "in"}
          onClick={() => setDirection("in")}
          className={`btn ${direction === "in" ? "btn-primary" : "btn-secondary"}`}
        >
          + Money in
        </button>
        <button
          type="button"
          aria-pressed={direction === "out"}
          onClick={() => setDirection("out")}
          className={`btn ${direction === "out" ? "btn-danger" : "btn-secondary"}`}
        >
          – Money out
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextField
          label="Amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <TextField
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Allowance, Chores, Spent at store"
      />
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? <Spinner /> : direction === "in" ? "Add money" : "Subtract money"}
      </button>
    </form>
  );
}
