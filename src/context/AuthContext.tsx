import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type Role = "parent" | "kid";

export interface Member {
  id: string;
  household_id: string;
  user_id: string;
  role: Role;
  display_name: string;
  username: string | null;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  member: Member | null;
  householdName: string | null;
  role: Role | null;
  refreshMember: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [householdName, setHouseholdName] = useState<string | null>(null);

  const loadMember = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setMember(null);
      setHouseholdName(null);
      return;
    }
    const { data, error } = await supabase
      .from("household_members")
      .select("id, household_id, user_id, role, display_name, username, households(name)")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) {
      setMember(null);
      setHouseholdName(null);
      return;
    }
    // `households` is an embedded relation; read it loosely to sidestep the
    // generated embed typings, then keep only the flat member fields.
    const row = data as Record<string, unknown> & {
      households?: { name: string } | null;
    };
    setMember({
      id: row.id as string,
      household_id: row.household_id as string,
      user_id: row.user_id as string,
      role: row.role as Role,
      display_name: row.display_name as string,
      username: (row.username as string | null) ?? null,
    });
    setHouseholdName(row.households?.name ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      loadMember(data.session?.user?.id).finally(() => {
        if (active) setLoading(false);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Defer DB calls; running them inside the auth callback can deadlock supabase-js.
      setTimeout(() => {
        loadMember(newSession?.user?.id);
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadMember]);

  const refreshMember = useCallback(async () => {
    // Read the live session straight from the client rather than the closed-over
    // React state. Right after sign-up the SignUp page still holds a callback
    // captured while logged out (session === null), so relying on the closure
    // would query `loadMember(undefined)` and wipe the membership we just created.
    const { data } = await supabase.auth.getSession();
    await loadMember(data.session?.user?.id);
  }, [loadMember]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMember(null);
    setHouseholdName(null);
  }, []);

  const value: AuthState = {
    loading,
    session,
    user: session?.user ?? null,
    member,
    householdName,
    role: member?.role ?? null,
    refreshMember,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
