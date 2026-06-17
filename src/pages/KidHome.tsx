import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { EmptyState, Money, Spinner } from "../components/ui";
import { AddToHomeScreenModal, isStandalone } from "../components/AddToHomeScreenModal";
import { AccountGlyph } from "../components/appearance";
import { cardTint } from "../lib/appearance";
import { formatCents } from "../lib/money";

interface AccountBalance {
  account_id: string;
  name: string;
  balance_cents: number;
  color: string | null;
  account_type: string | null;
  brand: string | null;
}

export default function KidHome() {
  const { member } = useAuth();
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("account_balances")
        .select("account_id, name, balance_cents, color, account_type, brand")
        .order("name");
      setAccounts((data ?? []) as AccountBalance[]);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10 text-green-700">
        <Spinner className="h-7 w-7" />
      </div>
    );

  const total = accounts.reduce((s, a) => s + a.balance_cents, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        Hi {member?.display_name}! <span aria-hidden="true">👋</span>
      </h1>

      <div className="card border-green-700 bg-green-700 text-center text-white">
        <p className="text-sm text-green-100">Total money</p>
        <p className="text-3xl font-bold text-white">{formatCents(total)}</p>
      </div>

      <h2 className="font-semibold">Your accounts</h2>
      {accounts.length === 0 ? (
        <EmptyState title="No accounts yet">Ask a parent to set one up for you.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {accounts.map((a) => (
            <li key={a.account_id}>
              <Link
                to={`/app/account/${a.account_id}`}
                className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition hover:shadow ${cardTint(a.color)}`}
              >
                <AccountGlyph accountType={a.account_type} brand={a.brand} color={a.color} />
                <span className="min-w-0 flex-1 truncate font-medium">{a.name}</span>
                <Money cents={a.balance_cents} className="font-semibold" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!isStandalone() && (
        <button
          className="card flex w-full items-center justify-between text-left hover:border-green-300"
          onClick={() => setShowInstall(true)}
        >
          <span>
            <span className="font-medium">Put Bank of Dad on your home screen</span>
            <span className="block text-sm text-slate-500">
              So it opens like a real app. Tap to see how!
            </span>
          </span>
          <span aria-hidden="true" className="text-xl">
            📲
          </span>
        </button>
      )}

      <AddToHomeScreenModal open={showInstall} onClose={() => setShowInstall(false)} />
    </div>
  );
}
