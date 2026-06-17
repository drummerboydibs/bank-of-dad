import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { SelectField, TextField } from "../components/form";
import { EmptyState, Money, Spinner } from "../components/ui";
import { formatCents } from "../lib/money";
import { formatDate } from "../lib/format";

interface AccountRow {
  id: string;
  name: string;
  kid_user_id: string;
}
interface LedgerRow {
  id: string;
  account_id: string;
  amount_cents: number;
  note: string | null;
  occurred_at: string;
  created_by_name: string | null;
  running_balance_cents: number;
}

export default function Reports() {
  const { role } = useAuth();
  const isParent = role === "parent";

  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [kidNames, setKidNames] = useState<Record<string, string>>({});
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [kidFilter, setKidFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);

  // Load the filter metadata once.
  useEffect(() => {
    (async () => {
      const [{ data: accData }, { data: kidData }] = await Promise.all([
        supabase.from("accounts").select("id, name, kid_user_id").order("name"),
        supabase.from("household_members").select("user_id, display_name").eq("role", "kid"),
      ]);
      setAccounts((accData ?? []) as AccountRow[]);
      const map: Record<string, string> = {};
      for (const k of kidData ?? []) map[k.user_id as string] = k.display_name as string;
      setKidNames(map);
      setLoadingMeta(false);
    })();
  }, []);

  // Which accounts are in scope given the kid + account filters.
  const scopedAccountIds = useMemo(() => {
    let list = accounts;
    if (isParent && kidFilter !== "all") list = list.filter((a) => a.kid_user_id === kidFilter);
    if (accountFilter !== "all") list = list.filter((a) => a.id === accountFilter);
    return list.map((a) => a.id);
  }, [accounts, kidFilter, accountFilter, isParent]);

  // Re-query when the structural (server-side) filters change.
  useEffect(() => {
    (async () => {
      if (scopedAccountIds.length === 0) {
        setRows([]);
        setLoadingRows(false);
        return;
      }
      setLoadingRows(true);
      let q = supabase
        .from("transactions_with_balance")
        .select(
          "id, account_id, amount_cents, note, occurred_at, created_by_name, running_balance_cents",
        )
        .in("account_id", scopedAccountIds)
        .order("occurred_at", { ascending: false })
        .order("created_at", { ascending: false });
      if (from) q = q.gte("occurred_at", new Date(`${from}T00:00:00`).toISOString());
      if (to) q = q.lte("occurred_at", new Date(`${to}T23:59:59`).toISOString());
      const { data } = await q;
      setRows((data ?? []) as LedgerRow[]);
      setLoadingRows(false);
    })();
  }, [scopedAccountIds, from, to]);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "Account";

  // Client-side search across notes and amounts (small data; keeps it simple).
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const noteMatch = (r.note ?? "").toLowerCase().includes(term);
      const amountMatch =
        formatCents(r.amount_cents).toLowerCase().includes(term) ||
        (Math.abs(r.amount_cents) / 100).toFixed(2).includes(term);
      return noteMatch || amountMatch;
    });
  }, [rows, search]);

  const totals = useMemo(() => {
    let inc = 0;
    let out = 0;
    for (const r of visible) {
      if (r.amount_cents >= 0) inc += r.amount_cents;
      else out += r.amount_cents;
    }
    return { inc, out, net: inc + out };
  }, [visible]);

  const accountOptions = useMemo(() => {
    if (isParent && kidFilter !== "all")
      return accounts.filter((a) => a.kid_user_id === kidFilter);
    return accounts;
  }, [accounts, kidFilter, isParent]);

  const hasFilters =
    kidFilter !== "all" || accountFilter !== "all" || !!from || !!to || !!search;

  if (loadingMeta)
    return (
      <div className="flex justify-center py-10 text-green-700">
        <Spinner className="h-7 w-7" />
      </div>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{isParent ? "Reports" : "History"}</h1>

      <div className="card space-y-3">
        {isParent && (
          <SelectField
            label="Kid"
            value={kidFilter}
            onChange={(e) => {
              setKidFilter(e.target.value);
              setAccountFilter("all");
            }}
          >
            <option value="all">All kids</option>
            {Object.entries(kidNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </SelectField>
        )}
        <SelectField
          label="Account"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
        >
          <option value="all">All accounts</option>
          {accountOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {isParent ? `${kidNames[a.kid_user_id] ?? "?"} · ${a.name}` : a.name}
            </option>
          ))}
        </SelectField>
        {/* min-w-0 lets each column shrink below the date input's intrinsic
            width; without it the native date fields overflow and overlap on
            narrow screens. */}
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <TextField
              label="From"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <TextField
              label="To"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        <TextField
          label="Search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes or amounts"
        />
        {hasFilters && (
          <button
            className="btn btn-ghost w-full"
            onClick={() => {
              setKidFilter("all");
              setAccountFilter("all");
              setFrom("");
              setTo("");
              setSearch("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center">
          <p className="text-xs text-slate-500">In</p>
          <Money cents={totals.inc} signed className="font-semibold" />
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500">Out</p>
          <Money cents={totals.out} className="font-semibold" />
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500">Net</p>
          <Money cents={totals.net} signed className="font-semibold" />
        </div>
      </div>

      {loadingRows ? (
        <div className="flex justify-center py-8 text-green-700">
          <Spinner className="h-6 w-6" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState title="No transactions found">Try adjusting your filters.</EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {visible.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {r.note || (r.amount_cents >= 0 ? "Deposit" : "Withdrawal")}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {formatDate(r.occurred_at)} · {accountName(r.account_id)}
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
