import { supabase } from "./supabase";

/**
 * Calls the `manage-kids` Edge Function and surfaces a clean error message.
 * Used for the privileged actions: create a kid, reset a kid's password,
 * and remove a kid.
 */
export async function callManageKids<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("manage-kids", { body });
  if (error) {
    let message = error.message ?? "Request failed";
    const ctx = (error as unknown as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        if (body?.error) message = body.error;
      } catch {
        /* keep the default message */
      }
    }
    throw new Error(message);
  }
  return data as T;
}
