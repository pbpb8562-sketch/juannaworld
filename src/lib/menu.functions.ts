import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseMenuText, type ParsedMenu } from "./menu-parser";
import type { Database } from "@/integrations/supabase/types";

const GDOC_TXT_URL =
  "https://docs.google.com/document/d/1-L_txxNtkd_cHb08kQMO7FpLn-tk9wXM4lo7wcK5DdE/export?format=txt";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("menu_cache")
    .select("parsed, fetched_at, error, raw_text")
    .eq("id", 1)
    .maybeSingle();
  return {
    parsed: (data?.parsed as ParsedMenu | null) ?? null,
    fetched_at: data?.fetched_at ?? null,
    error: data?.error ?? null,
    has_raw: !!data?.raw_text,
  };
});

export async function fetchAndCache(): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  try {
    const res = await fetch(GDOC_TXT_URL, { redirect: "follow" });
    if (!res.ok) throw new Error(`Doc fetch ${res.status}`);
    const raw = await res.text();
    const parsed = parseMenuText(raw);
    await supabaseAdmin
      .from("menu_cache")
      .update({ raw_text: raw, parsed, fetched_at: new Date().toISOString(), error: null })
      .eq("id", 1);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabaseAdmin
      .from("menu_cache")
      .update({ error: msg, fetched_at: new Date().toISOString() })
      .eq("id", 1);
    return { ok: false, error: msg };
  }
}

export const refreshMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: adminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRow) throw new Error("Forbidden");
    return fetchAndCache();
  });
