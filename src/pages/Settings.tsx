import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { TextField } from "../components/form";
import { Alert, Spinner } from "../components/ui";

export default function Settings() {
  const navigate = useNavigate();
  const { member, householdName, user, refreshMember, signOut } = useAuth();
  const [name, setName] = useState(householdName ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    const { error } = await supabase
      .from("households")
      .update({ name: name.trim() })
      .eq("id", member?.household_id ?? "");
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await refreshMember();
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <form onSubmit={saveName} className="card space-y-3">
        <TextField
          label="Family name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          required
        />
        {error && <Alert>{error}</Alert>}
        {saved && <Alert kind="success">Saved.</Alert>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "Save"}
        </button>
      </form>

      <div className="card space-y-1">
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="font-medium">{member?.display_name}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
      </div>

      <button
        className="btn btn-secondary w-full"
        onClick={async () => {
          await signOut();
          navigate("/");
        }}
      >
        Sign out
      </button>
    </div>
  );
}
