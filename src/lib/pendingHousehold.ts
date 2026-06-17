// When a brand-new parent signs up but email confirmation is on, there's no
// session yet, so we can't run `setup_parent_account` at the SignUp step. We
// stash the household details they already typed so the /setup (Onboarding)
// form can pre-fill them after they confirm and log in — no retyping. Cleared
// once the household is actually created.
const KEY = "bod.pendingHousehold";

export interface PendingHousehold {
  parentName: string;
  householdName: string;
}

export function savePendingHousehold(value: PendingHousehold): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota). The stash is a
    // convenience, not load-bearing, so failing to save is fine.
  }
}

export function readPendingHousehold(): PendingHousehold | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingHousehold>;
    if (typeof parsed.parentName !== "string" || typeof parsed.householdName !== "string") {
      return null;
    }
    return { parentName: parsed.parentName, householdName: parsed.householdName };
  } catch {
    return null;
  }
}

export function clearPendingHousehold(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore — see savePendingHousehold
  }
}
