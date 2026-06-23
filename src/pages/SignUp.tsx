import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { TextField } from "../components/form";
import { HouseholdFields } from "../components/HouseholdFields";
import { Alert, Spinner } from "../components/ui";
import { clearPendingHousehold, savePendingHousehold } from "../lib/pendingHousehold";

export default function SignUp() {
  const navigate = useNavigate();
  const { refreshMember } = useAuth();
  const [parentName, setParentName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }

    if (!data.session) {
      // Email confirmation is turned on for this project, so there's no session
      // to run setup_parent_account against yet. Stash what they typed so the
      // /setup form pre-fills it after they confirm and log in.
      savePendingHousehold({
        parentName: parentName.trim(),
        householdName: householdName.trim(),
      });
      setBusy(false);
      setNotice(
        "Account created! Check your email from our partner Supabase to confirm, then log in to finish setting up your family.",
      );
      return;
    }

    // Signed in right away — create the household and membership.
    const { error: rpcError } = await supabase.rpc("setup_parent_account", {
      p_household_name: householdName.trim(),
      p_display_name: parentName.trim(),
    });
    if (rpcError) {
      setBusy(false);
      setError(rpcError.message);
      return;
    }
    clearPendingHousehold();
    await refreshMember();
    setBusy(false);
    navigate("/app");
  }

  return (
    <AuthShell title="Create your family bank" subtitle="You'll be the first parent on the account.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {notice && (
          <Alert kind="success">
            {notice}{" "}
            <Link to="/login" className="font-semibold underline">
              Go to login
            </Link>
          </Alert>
        )}
        <HouseholdFields
          parentName={parentName}
          householdName={householdName}
          onParentName={setParentName}
          onHouseholdName={setHouseholdName}
        />
        <TextField
          label="Email"
          type="email"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-green-800">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
