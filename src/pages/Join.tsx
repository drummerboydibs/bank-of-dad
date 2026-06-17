import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { TextField } from "../components/form";
import { Alert, FullPageSpinner, Spinner } from "../components/ui";

interface InviteInfo {
  household_name: string;
  role: string;
  display_name: string;
  valid: boolean;
}

export default function Join() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { loading, session, member, refreshMember, signOut } = useAuth();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Auth form state for logged-out visitors.
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_invite", { p_token: token });
      const row = Array.isArray(data) ? data[0] : data;
      setInvite((row as InviteInfo) ?? null);
      setLoadingInvite(false);
    })();
  }, [token]);

  async function authenticate(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setBusy(true);
    const creds = { email: email.trim().toLowerCase(), password };
    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp(creds)
        : await supabase.auth.signInWithPassword(creds);
    setBusy(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (mode === "signup" && !data.session) {
      setAuthError("Account created! Confirm your email, then reopen this link to join.");
      return;
    }
    // The session is now active; onAuthStateChange re-renders to the accept step.
  }

  async function accept() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.rpc("redeem_invite", {
      p_token: token,
      p_display_name: invite?.display_name ?? undefined,
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

  if (loading || loadingInvite) return <FullPageSpinner />;

  if (!invite || !invite.valid) {
    return (
      <AuthShell title="Invite not found">
        <Alert>This invite link is invalid, already used, or expired.</Alert>
        <Link to="/" className="btn btn-secondary mt-4 w-full">
          Go home
        </Link>
      </AuthShell>
    );
  }

  // Signed in already.
  if (session) {
    if (member) {
      return (
        <AuthShell title="You're already in a family">
          <Alert>
            You already belong to a household, so you can't join another with this account.
          </Alert>
          <button className="btn btn-secondary mt-4 w-full" onClick={() => navigate("/app")}>
            Go to my family
          </button>
          <button className="btn btn-ghost mt-2 w-full" onClick={() => signOut()}>
            Use a different account
          </button>
        </AuthShell>
      );
    }
    return (
      <AuthShell
        title={`Join ${invite.household_name}`}
        subtitle={`You've been invited as a ${invite.role}.`}
      >
        {error && <Alert>{error}</Alert>}
        <button className="btn btn-primary w-full" onClick={accept} disabled={busy}>
          {busy ? <Spinner /> : `Join ${invite.household_name}`}
        </button>
        <button className="btn btn-ghost mt-2 w-full" onClick={() => signOut()}>
          Use a different account
        </button>
      </AuthShell>
    );
  }

  // Logged out: authenticate first.
  return (
    <AuthShell
      title={`Join ${invite.household_name}`}
      subtitle={`You've been invited as a ${invite.role}. Create a login (or sign in) to accept.`}
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={mode === "signup"}
          className={`btn ${mode === "signup" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("signup")}
        >
          Create login
        </button>
        <button
          type="button"
          aria-pressed={mode === "login"}
          className={`btn ${mode === "login" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("login")}
        >
          I have one
        </button>
      </div>
      <form onSubmit={authenticate} className="space-y-4">
        {authError && <Alert>{authError}</Alert>}
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
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : mode === "signup" ? "Create login & continue" : "Sign in & continue"}
        </button>
      </form>
    </AuthShell>
  );
}
