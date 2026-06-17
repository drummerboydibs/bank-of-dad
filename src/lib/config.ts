// ---------------------------------------------------------------------------
// Public configuration. These values are SAFE to commit to a public repo.
// The Supabase publishable key only grants access permitted by Row-Level
// Security — it is NOT a secret and is meant to live in the browser.
// ---------------------------------------------------------------------------

export const SUPABASE_URL = "https://msxjsrfaciwfybbwyxhh.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Sm7E5cjVBytoDiMQef3uYg_KkahzFNf";

// Kids log in with a username. Under the hood we turn that into a synthetic
// login email of the form `username@kids.bankofdad.app`. This MUST stay in
// sync with the KID_EMAIL_DOMAIN constant in the `manage-kids` Edge Function.
export const KID_EMAIL_DOMAIN = "kids.bankofdad.app";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${KID_EMAIL_DOMAIN}`;
}
