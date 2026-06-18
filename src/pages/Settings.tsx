import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth, type Member } from "../context/AuthContext";
import { TextField } from "../components/form";
import { Avatar, ColorPicker, EmojiPicker } from "../components/appearance";
import { Alert, Spinner } from "../components/ui";
import { AddToHomeScreenModal, isStandalone } from "../components/AddToHomeScreenModal";
import { DEFAULT_COLOR_KEY } from "../lib/appearance";

export default function Settings() {
  const navigate = useNavigate();
  const { member, householdName, user, role, refreshMember, signOut } = useAuth();
  const isParent = role === "parent";
  const [name, setName] = useState(householdName ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

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

      {member && <AppearanceCard member={member} onSaved={refreshMember} />}

      {isParent && (
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
      )}

      <div className="card space-y-1">
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="font-medium">{member?.display_name}</p>
        <p className="text-sm text-slate-500">
          {isParent ? user?.email : `@${member?.username}`}
        </p>
      </div>

      {!isStandalone() && (
        <button
          className="card flex w-full items-center justify-between text-left hover:border-green-300"
          onClick={() => setShowInstall(true)}
        >
          <span>
            <span className="font-medium">Add to Home Screen</span>
            <span className="block text-sm text-slate-500">
              Install the app for one-tap, full-screen access.
            </span>
          </span>
          <span aria-hidden="true" className="text-xl">
            📲
          </span>
        </button>
      )}

      <button
        className="btn btn-secondary w-full"
        onClick={async () => {
          await signOut();
          navigate("/");
        }}
      >
        Sign out
      </button>

      <AddToHomeScreenModal open={showInstall} onClose={() => setShowInstall(false)} />
    </div>
  );
}

/** Lets the signed-in member edit their own avatar + color (issue #12). */
function AppearanceCard({ member, onSaved }: { member: Member; onSaved: () => Promise<void> }) {
  const [color, setColor] = useState(member.color ?? DEFAULT_COLOR_KEY);
  const [avatar, setAvatar] = useState<string | null>(member.avatar);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setError(null);
    setSaved(false);
    setBusy(true);
    const { error } = await supabase.rpc("set_member_appearance", {
      p_user_id: member.user_id,
      p_color: color,
      p_avatar: avatar,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await onSaved();
    setSaved(true);
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={member.display_name} color={color} avatar={avatar} size="lg" />
        <div>
          <p className="font-semibold">Your look</p>
          <p className="text-sm text-slate-500">Pick a color and an avatar.</p>
        </div>
      </div>
      <ColorPicker
        value={color}
        onChange={(c) => {
          setColor(c);
          setSaved(false);
        }}
      />
      <EmojiPicker
        value={avatar}
        onChange={(a) => {
          setAvatar(a);
          setSaved(false);
        }}
      />
      {error && <Alert>{error}</Alert>}
      {saved && <Alert kind="success">Saved.</Alert>}
      <button className="btn btn-primary w-full" onClick={save} disabled={busy}>
        {busy ? <Spinner /> : "Save"}
      </button>
    </div>
  );
}
