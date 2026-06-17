import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import AddKidModal from "../components/AddKidModal";
import { Avatar } from "../components/appearance";
import { TextField } from "../components/form";
import { Alert, EmptyState, Modal, Spinner } from "../components/ui";
import { cardTint } from "../lib/appearance";
import { formatDate } from "../lib/format";

interface MemberRow {
  user_id: string;
  display_name: string;
  role: string;
  username: string | null;
  color: string | null;
  avatar: string | null;
}
interface InviteRow {
  id: string;
  token: string;
  display_name: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

function inviteLink(token: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}#/join/${token}`;
}

export default function Family() {
  const { member, user } = useAuth();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddKid, setShowAddKid] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: m }, { data: inv }] = await Promise.all([
      supabase
        .from("household_members")
        .select("user_id, display_name, role, username, color, avatar")
        .order("role"),
      supabase
        .from("invites")
        .select("id, token, display_name, created_at, expires_at, accepted_at")
        .order("created_at", { ascending: false }),
    ]);
    setMembers((m ?? []) as MemberRow[]);
    setInvites((inv ?? []) as InviteRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function revoke(id: string) {
    await supabase.from("invites").delete().eq("id", id);
    load();
  }

  if (loading)
    return (
      <div className="flex justify-center py-10 text-green-700">
        <Spinner className="h-7 w-7" />
      </div>
    );

  const parents = members.filter((m) => m.role === "parent");
  const kids = members.filter((m) => m.role === "kid");
  const pending = invites.filter(
    (i) => !i.accepted_at && new Date(i.expires_at) > new Date(),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Family</h1>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Parents &amp; guardians</h2>
          <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
            + Invite
          </button>
        </div>
        <ul className="space-y-2">
          {parents.map((p) => (
            <li key={p.user_id} className="card flex items-center justify-between py-3">
              <span className="font-medium">{p.display_name}</span>
              {p.user_id === user?.id && <span className="text-xs text-slate-500">You</span>}
            </li>
          ))}
        </ul>

        {pending.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">Pending invites</p>
            {pending.map((i) => (
              <div key={i.id} className="card space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{i.display_name}</p>
                    <p className="text-xs text-slate-500">Expires {formatDate(i.expires_at)}</p>
                  </div>
                  <button className="btn btn-ghost text-red-600" onClick={() => revoke(i.id)}>
                    Revoke
                  </button>
                </div>
                <CopyLink link={inviteLink(i.token)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Kids</h2>
          <button className="btn btn-secondary" onClick={() => setShowAddKid(true)}>
            + Add kid
          </button>
        </div>
        {kids.length === 0 ? (
          <EmptyState title="No kids yet" />
        ) : (
          <ul className="space-y-2">
            {kids.map((k) => (
              <li key={k.user_id}>
                <Link
                  to={`/app/kid/${k.user_id}`}
                  className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition hover:shadow ${cardTint(k.color)}`}
                >
                  <Avatar name={k.display_name} color={k.color} avatar={k.avatar} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{k.display_name}</span>
                    <span className="block truncate text-xs text-slate-500">@{k.username}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InviteParentModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onCreated={load}
        householdId={member?.household_id ?? ""}
        createdBy={user?.id ?? ""}
      />
      <AddKidModal open={showAddKid} onClose={() => setShowAddKid(false)} onCreated={load} />
    </div>
  );
}

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; the user can still select the text */
    }
  }
  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        aria-label="Invite link"
        className="input flex-1 text-xs"
        value={link}
        onFocus={(e) => e.target.select()}
      />
      <button type="button" className="btn btn-secondary shrink-0" onClick={copy}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function InviteParentModal({
  open,
  onClose,
  onCreated,
  householdId,
  createdBy,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  householdId: string;
  createdBy: string;
}) {
  const [displayName, setDisplayName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setDisplayName("");
    setToken(null);
    setError(null);
    onClose();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { data, error } = await supabase
      .from("invites")
      .insert({ household_id: householdId, display_name: displayName.trim(), created_by: createdBy })
      .select("token")
      .single();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? "Could not create invite");
      return;
    }
    setToken(data.token as string);
    onCreated();
  }

  return (
    <Modal open={open} onClose={close} title="Invite a parent or guardian">
      {token ? (
        <div className="space-y-3">
          <Alert kind="success">
            Invite ready! Share this link. They'll create their own login and join your family.
          </Alert>
          <CopyLink link={inviteLink(token)} />
          <button className="btn btn-primary w-full" onClick={close}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <TextField
            label="Their name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Mom"
            required
          />
          <p className="text-xs text-slate-500">
            You'll get a private link to send them. It lets them join as a co-parent with full
            access, and expires in 14 days.
          </p>
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? <Spinner /> : "Create invite link"}
          </button>
        </form>
      )}
    </Modal>
  );
}
