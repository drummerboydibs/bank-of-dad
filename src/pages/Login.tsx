import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usernameToEmail } from "../lib/config";
import AuthShell from "../components/AuthShell";
import { TextField } from "../components/form";
import { Alert, Spinner } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const id = identifier.trim();
    // Parents log in with an email; kids log in with a username.
    const email = id.includes("@") ? id.toLowerCase() : usernameToEmail(id);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("That login didn't work. Double-check the username/email and password.");
      return;
    }
    navigate("/app");
  }

  return (
    <AuthShell title="Welcome back">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <TextField
          label="Email or username"
          autoCapitalize="none"
          autoCorrect="off"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@email.com or kidname"
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        New here?{" "}
        <Link to="/signup" className="font-semibold text-green-800">
          Create a parent account
        </Link>
      </p>
    </AuthShell>
  );
}
