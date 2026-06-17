import { useState, type FormEvent } from "react";
import { callManageKids } from "../lib/api";
import { TextField } from "./form";
import { Alert, Modal, Spinner } from "./ui";

export default function AddKidModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [account, setAccount] = useState("Savings");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setDisplayName("");
    setUsername("");
    setPassword("");
    setAccount("Savings");
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await callManageKids({
        action: "create_kid",
        username,
        password,
        display_name: displayName,
        initial_account_name: account.trim() || null,
      });
      setBusy(false);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not create kid");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a kid">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <TextField
          label="Kid's name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Liam"
          required
        />
        <TextField
          label="Username (for logging in)"
          autoCapitalize="none"
          autoCorrect="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. liam"
          required
          hint="Letters, numbers, dot, dash, underscore. Used to log in — no email needed. Usernames are unique across the whole app."
        />
        <TextField
          label="Password"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="at least 6 characters"
          minLength={6}
          required
          hint="You set this and share it with your kid."
        />
        <TextField
          label="First account (optional)"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="e.g. Savings"
        />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "Create kid login"}
        </button>
      </form>
    </Modal>
  );
}
