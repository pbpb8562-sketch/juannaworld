import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden");
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: roles }, { data: orders }, { data: ledger }] =
      await Promise.all([
        context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
        context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
        context.supabase
          .from("orders")
          .select("*")
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(50),
        context.supabase
          .from("rewards_ledger")
          .select("*")
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
    return {
      profile,
      isAdmin: (roles ?? []).some((r: { role: string }) => r.role === "admin"),
      orders: orders ?? [],
      ledger: ledger ?? [],
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string; address: string; phone: string }) =>
    z
      .object({
        message: z.string().min(3).max(2000),
        address: z.string().max(500),
        phone: z.string().max(40),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .insert({
        user_id: context.userId,
        message: data.message,
        address: data.address,
        phone: data.phone,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!orders?.length) return { orders: [] as any[] };
    const ids = Array.from(new Set(orders.map((o) => o.user_id)));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, username, phone, points")
      .in("id", ids);
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
    return {
      orders: orders.map((o) => ({ ...o, profile: byId.get(o.user_id) ?? null })),
    };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "pending" | "delivered" | "cancelled" }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "delivered", "cancelled"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adjustReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { username: string; points: number; reason: string }) =>
    z
      .object({
        username: z.string().min(1),
        points: z.number().int().min(-10000).max(10000),
        reason: z.string().max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (!prof) throw new Error("User not found");
    const { error } = await supabaseAdmin.from("rewards_ledger").insert({
      user_id: prof.id,
      points_delta: data.points,
      reason: data.reason,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { username: string; newPassword: string }) =>
    z
      .object({
        username: z.string().min(1),
        newPassword: z.string().min(8).max(72),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .ilike("username", data.username)
      .maybeSingle();
    if (!prof) throw new Error("User not found");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(prof.id, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true, username: prof.username };
  });
