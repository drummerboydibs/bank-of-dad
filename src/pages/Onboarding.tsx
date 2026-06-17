import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { HouseholdFields } from "../components/HouseholdFields";
import { Alert, FullPageSpinner, Spinner } from "../components/ui";
import { clearPendingHousehold, readPendingHousehold } from "../lib/pendingHousehold";

export default function Onboarding() {
  const navigate = useNavigate();
  const { loading, session, member, refreshMember, signOut } = useAuth();
  // Pre-fill from what they typed on SignUp before email confirmation.
  const [parentName, setParentName] = useState(() => readPendingHousehold()?.parentName ?? "");
  const [householdName, setHouseholdName] = useState(
    () => readPendingHousehold()?.householdName ?? "",
  );
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
    clearPendingHousehold();
    await refreshMember();
    setBusy(false);
    navigate("/app");
  }

  return (
    <AuthShell title="Set up your family" subtitle="Just a couple details to get started.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <HouseholdFields
          parentName={parentName}
          householdName={householdName}
          onParentName={setParentName}
          onHouseholdName={setHouseholdName}
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
