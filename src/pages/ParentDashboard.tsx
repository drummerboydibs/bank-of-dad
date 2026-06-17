import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { EmptyState, Money, Spinner } from "../components/ui";
import AddKidModal from "../components/AddKidModal";

interface KidRow {
  user_id: string;
  display_name: string;
  username: string | null;
}

export default function ParentDashboard() {
  const [kids, setKids] = useState<KidRow[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: kidData }, { data: balData }] = await Promise.all([
      supabase
        .from("household_members")
        .select("user_id, display_name, username")
        .eq("role", "kid")
        .order("display_name"),
      supabase.from("account_balances").select("kid_user_id, balance_cents"),
    ]);
    setKids((kidData ?? []) as KidRow[]);
    const t: Record<string, number> = {};
    const c: Record<string, number> = {};
    for (const row of balData ?? []) {
      const k = row.kid_user_id as string;
      t[k] = (t[k] ?? 0) + (row.balance_cents ?? 0);
      c[k] = (c[k] ?? 0) + 1;
    }
    setTotals(t);
    setCounts(c);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Kids</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add kid
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-green-700">
          <Spinner className="h-7 w-7" />
        </div>
      ) : kids.length === 0 ? (
        <EmptyState title="No kids yet">Add your first kid to start tracking their money.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {kids.map((kid) => {
            const n = counts[kid.user_id] ?? 0;
            return (
              <li key={kid.user_id}>
                <Link
                  to={`/app/kid/${kid.user_id}`}
                  className="card flex items-center justify-between hover:border-green-300"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{kid.display_name}</p>
                    <p className="truncate text-xs text-slate-500">
                      @{kid.username} · {n} account{n === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Money cents={totals[kid.user_id] ?? 0} className="text-lg font-bold" />
                    <p className="text-xs text-slate-500">total</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <AddKidModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={load} />
    </div>
  );
}
