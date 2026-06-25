import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAllOrders,
  updateOrderStatus,
  adjustReward,
  adminResetPassword,
  getMyProfile,
} from "@/lib/orders.functions";
import { refreshMenu, getMenu } from "@/lib/menu.functions";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/juanna-world-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · Juanna World" }] }),
  beforeLoad: async () => {
    // Gate is client-side via the parent; double-check via profile fetch in the page.
  },
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const fetchProfile = useServerFn(getMyProfile);
  const fetchOrders = useServerFn(listAllOrders);
  const fetchMenu = useServerFn(getMenu);
  const setStatus = useServerFn(updateOrderStatus);
  const reward = useServerFn(adjustReward);
  const reset = useServerFn(adminResetPassword);
  const refresh = useServerFn(refreshMenu);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchOrders(),
    enabled: !!profile.data?.isAdmin,
  });
  const menu = useQuery({
    queryKey: ["menu"],
    queryFn: () => fetchMenu(),
  });

  if (profile.isLoading) return <Centered>Loading…</Centered>;
  if (!profile.data?.isAdmin) {
    return (
      <Centered>
        <p className="text-muted-foreground">Not authorized.</p>
        <Link to="/dashboard" className="mt-3 inline-block text-primary underline">
          Back to dashboard
        </Link>
      </Centered>
    );
  }

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "delivered" | "cancelled" }) =>
      setStatus({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
  const rewardMut = useMutation({
    mutationFn: (v: { username: string; points: number; reason: string }) =>
      reward({ data: v }),
  });
  const resetMut = useMutation({
    mutationFn: (v: { username: string; newPassword: string }) => reset({ data: v }),
  });
  const refreshMut = useMutation({
    mutationFn: () => refresh(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo.url} alt="" className="w-10 h-10" />
            <span className="font-display font-extrabold text-lg">
              Juanna <span className="text-gradient-flame">World</span> · Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            >
              ← Dashboard
            </Link>
            <button
              onClick={signOut}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-10">
        {/* Menu cache */}
        <section>
          <SectionHead title="Menu cache" sub="Auto-syncs every 2 hours from the Google Doc." />
          <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Last fetched:{" "}
              <span className="text-foreground font-semibold">
                {menu.data?.fetched_at
                  ? new Date(menu.data.fetched_at).toLocaleString()
                  : "never"}
              </span>
              {menu.data?.error && (
                <div className="mt-1 text-xs text-red-300">Error: {menu.data.error}</div>
              )}
            </div>
            <button
              onClick={() => refreshMut.mutate()}
              disabled={refreshMut.isPending}
              className="rounded-full bg-primary text-primary-foreground font-semibold px-5 py-2 shadow-glow hover:opacity-90 transition disabled:opacity-60"
            >
              {refreshMut.isPending ? "Refreshing…" : "Refresh now"}
            </button>
          </div>
        </section>

        {/* Orders */}
        <section>
          <SectionHead title="All orders" sub="Mark as delivered or cancelled." />
          <div className="space-y-2">
            {orders.isLoading && <p className="text-muted-foreground">Loading orders…</p>}
            {orders.data?.orders.length === 0 && (
              <p className="text-muted-foreground">No orders yet.</p>
            )}
            {orders.data?.orders.map((o: any) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-display font-extrabold">
                      @{o.profile?.username ?? "user"}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        · {o.phone || o.profile?.phone || "no phone"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()} · #{o.id.slice(0, 8)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(["pending", "delivered", "cancelled"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => statusMut.mutate({ id: o.id, status: s })}
                        className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border transition ${
                          o.status === s
                            ? s === "delivered"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : s === "cancelled"
                                ? "bg-red-500/20 text-red-300 border-red-500/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {o.address && (
                  <div className="mt-2 text-xs text-muted-foreground">→ {o.address}</div>
                )}
                <div className="mt-2 whitespace-pre-wrap text-sm">{o.message}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Rewards */}
        <section>
          <SectionHead title="Add rewards" sub="Find by username, add or remove points." />
          <RewardForm
            onSubmit={(v) => rewardMut.mutate(v)}
            busy={rewardMut.isPending}
            result={
              rewardMut.isSuccess
                ? "Reward added."
                : rewardMut.isError
                  ? (rewardMut.error as Error).message
                  : null
            }
          />
        </section>

        {/* Password reset */}
        <section>
          <SectionHead title="Reset a user's password" sub="Type their username and a new password." />
          <ResetForm
            onSubmit={(v) => resetMut.mutate(v)}
            busy={resetMut.isPending}
            result={
              resetMut.isSuccess
                ? `Password reset for @${resetMut.data?.username}.`
                : resetMut.isError
                  ? (resetMut.error as Error).message
                  : null
            }
          />
        </section>
      </main>
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-display font-extrabold">{title}</h2>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-5">
      <div>{children}</div>
    </div>
  );
}

function RewardForm({
  onSubmit,
  busy,
  result,
}: {
  onSubmit: (v: { username: string; points: number; reason: string }) => void;
  busy: boolean;
  result: string | null;
}) {
  const [username, setU] = useState("");
  const [points, setP] = useState("");
  const [reason, setR] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseInt(points, 10);
        if (!username || isNaN(n)) return;
        onSubmit({ username, points: n, reason });
      }}
      className="rounded-2xl border border-border bg-card p-5 grid sm:grid-cols-[1fr_120px_1fr_auto] gap-3 items-end"
    >
      <Field label="Username" value={username} onChange={setU} />
      <Field label="Points (+/-)" value={points} onChange={setP} type="number" />
      <Field label="Reason" value={reason} onChange={setR} />
      <button
        disabled={busy}
        className="rounded-full bg-primary text-primary-foreground font-semibold px-5 py-2.5 shadow-glow hover:opacity-90 transition disabled:opacity-60"
      >
        {busy ? "…" : "Add"}
      </button>
      {result && <div className="sm:col-span-4 text-xs text-muted-foreground">{result}</div>}
    </form>
  );
}

function ResetForm({
  onSubmit,
  busy,
  result,
}: {
  onSubmit: (v: { username: string; newPassword: string }) => void;
  busy: boolean;
  result: string | null;
}) {
  const [username, setU] = useState("");
  const [pw, setPw] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!username || pw.length < 8) return;
        onSubmit({ username, newPassword: pw });
      }}
      className="rounded-2xl border border-border bg-card p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
    >
      <Field label="Username" value={username} onChange={setU} />
      <Field label="New password (8+)" value={pw} onChange={setPw} type="text" />
      <button
        disabled={busy}
        className="rounded-full bg-primary text-primary-foreground font-semibold px-5 py-2.5 shadow-glow hover:opacity-90 transition disabled:opacity-60"
      >
        {busy ? "…" : "Reset"}
      </button>
      {result && <div className="sm:col-span-3 text-xs text-muted-foreground">{result}</div>}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="mt-2 w-full rounded-xl bg-background border border-border px-3 py-2.5 outline-none focus:border-primary transition"
      />
    </div>
  );
}
