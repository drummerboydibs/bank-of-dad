import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { callManageKids } from "../lib/api";
import { TextField } from "../components/form";
import { Alert, EmptyState, Modal, Money, Spinner } from "../components/ui";

interface AccountBalance {
  account_id: string;
  name: string;
  balance_cents: number;
}
interface KidInfo {
  display_name: string;
  username: string | null;
}

export default function KidDetail() {
  const { kidId = "" } = useParams();
  const navigate = useNavigate();
  const { member } = useAuth();
  const [kid, setKid] = useState<KidInfo | null>(null);
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showManage, setShowManage] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: kidData }, { data: accData }] = await Promise.all([
      supabase
        .from("household_members")
        .select("display_name, username")
        .eq("user_id", kidId)
        .maybeSingle(),
      supabase
        .from("account_balances")
        .select("account_id, name, balance_cents")
        .eq("kid_user_id", kidId)
        .order("name"),
    ]);
    setKid((kidData as KidInfo) ?? null);
    setAccounts((accData ?? []) as AccountBalance[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidId]);

  if (loading)
    return (
      <div className="flex justify-center py-10 text-green-700">
        <Spinner className="h-7 w-7" />
      </div>
    );
  if (!kid)
    return (
      <EmptyState title="Kid not found">
        <Link to="/app" className="text-green-700">
          Back to home
        </Link>
      </EmptyState>
    );

  const total = accounts.reduce((s, a) => s + a.balance_cents, 0);

  return (
    <div className="space-y-4">
      <Link to="/app" className="text-sm text-slate-500">
        ← Kids
      </Link>

      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{kid.display_name}</h1>
          <p className="text-xs text-slate-500">@{kid.username}</p>
        </div>
        <div className="text-right">
          <Money cents={total} className="text-lg font-bold" />
          <p className="text-xs text-slate-500">total</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Accounts</h2>
        <button className="btn btn-secondary" onClick={() => setShowAddAccount(true)}>
          + Add account
        </button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState title="No accounts yet">
          Create an account like "Savings" or "Amazon gift card."
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {accounts.map((a) => (
            <li key={a.account_id}>
              <Link
                to={`/app/account/${a.account_id}`}
                className="card flex items-center justify-between hover:border-green-300"
              >
                <span className="font-medium">{a.name}</span>
                <Money cents={a.balance_cents} className="font-semibold" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-ghost w-full" onClick={() => setShowManage(true)}>
        Manage {kid.display_name}…
      </button>

      <AddAccountModal
        open={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onCreated={load}
        kidId={kidId}
        householdId={member?.household_id ?? ""}
      />
      <ManageKidModal
        open={showManage}
        onClose={() => setShowManage(false)}
        kidId={kidId}
        kidName={kid.display_name}
        onDeleted={() => navigate("/app")}
      />
    </div>
  );
}

function AddAccountModal({
  open,
  onClose,
  onCreated,
  kidId,
  householdId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  kidId: string;
  householdId: string;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.from("accounts").insert({
      household_id: householdId,
      kid_user_id: kidId,
      name: name.trim(),
      created_by: user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      setError(
        /duplicate|unique/i.test(error.message)
          ? "An account with that name already exists for this kid."
          : error.message,
      );
      return;
    }
    setName("");
    onCreated();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add an account">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <TextField
          label="Account name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Savings"
          required
        />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "Create account"}
        </button>
      </form>
    </Modal>
  );
}

function ManageKidModal({
  open,
  onClose,
  kidId,
  kidName,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  kidId: string;
  kidName: string;
  onDeleted: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await callManageKids({ action: "set_kid_password", kid_user_id: kidId, password });
      setNotice("Password updated.");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    }
    setBusy(false);
  }

  async function remove() {
    setError(null);
    setBusy(true);
    try {
      await callManageKids({ action: "delete_kid", kid_user_id: kidId });
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove kid");
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Manage ${kidName}`}>
      <div className="space-y-5">
        {error && <Alert>{error}</Alert>}
        {notice && <Alert kind="success">{notice}</Alert>}

        <form onSubmit={resetPassword} className="space-y-3">
          <TextField
            label="Set a new password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="at least 6 characters"
            minLength={6}
            required
          />
          <button className="btn btn-secondary w-full" disabled={busy}>
            {busy ? <Spinner /> : "Update password"}
          </button>
        </form>

        <div className="border-t border-slate-200 pt-4">
          {!confirmDelete ? (
            <button className="btn btn-danger w-full" onClick={() => setConfirmDelete(true)}>
              Remove {kidName}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                This permanently deletes {kidName}'s login, accounts, and history. This can't be
                undone.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger flex-1" onClick={remove} disabled={busy}>
                  {busy ? <Spinner /> : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
