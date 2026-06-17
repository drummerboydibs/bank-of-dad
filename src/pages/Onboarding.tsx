import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { TextField } from "../components/form";
import { Alert, FullPageSpinner, Spinner } from "../components/ui";

export default function Onboarding() {
  const navigate = useNavigate();
  const { loading, session, member, refreshMember, signOut } = useAuth();
  const [parentName, setParentName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <FullPageSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (member) return <Navigate to="/app" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.rpc("setup_parent_account", {
      p_household_name: householdName.trim(),
      p_display_name: parentName.trim(),
    });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    await refreshMember();
    setBusy(false);
    navigate("/app");
  }

  return (
    <AuthShell title="Set up your family" subtitle="Just a couple details to get started.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <TextField
          label="Your name"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          placeholder="e.g. Dad"
          required
        />
        <TextField
          label="Family name"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          placeholder="e.g. The Smith Family"
          required
        />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "Continue"}
        </button>
      </form>
      <button
        onClick={async () => {
          await signOut();
          navigate("/");
        }}
        className="btn btn-ghost mt-3 w-full"
      >
        Sign out
      </button>
    </AuthShell>
  );
}
