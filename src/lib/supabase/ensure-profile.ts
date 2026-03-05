import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ role: string }> {
  try {
    const { data: existing } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (existing) return { role: existing.role };

    const { data: inserted, error } = await supabase
      .from("profiles")
      .insert({ user_id: userId, role: "user" })
      .select("role")
      .single();

    if (error) throw error;
    return { role: inserted?.role ?? "user" };
  } catch {
    return { role: "user" };
  }
}
