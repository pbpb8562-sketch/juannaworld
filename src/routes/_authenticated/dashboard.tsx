import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMenu } from "@/lib/menu.functions";
import { getMyProfile, createOrder } from "@/lib/orders.functions";
import logo from "@/assets/juanna-world-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Juanna World" }] }),
  component: Dashboard,
});

type Tab = "menu" | "order" | "orders" | "rewards" | "support";

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("menu");

  const fetchProfile = useServerFn(getMyProfile);
  const fetchMenu = useServerFn(getMenu);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const menu = useQuery({ queryKey: ["menu"], queryFn: () => fetchMenu() });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const isAdmin = profile.data?.isAdmin;
  const username = profile.data?.profile?.username ?? "...";
  const points = profile.data?.profile?.points ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo.url} alt="" className="w-10 h-10" />
            <span className="font-display font-extrabold text-lg">
              Juanna <span className="text-gradient-flame">World</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-glow"
              >
                Admin
              </Link>
            )}
            <span className="hidden sm:inline text-xs text-muted-foreground">
              @<span className="text-foreground font-semibold">{username}</span> ·{" "}
              <span className="text-primary font-bold">{points} pts</span>
            </span>
            <button
              onClick={signOut}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-5 pb-3 flex gap-1 overflow-x-auto">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition bg-secondary text-secondary-foreground"
            >
              Admin Dashboard
            </Link>
          )}
          {(["menu", "order", "orders", "rewards", "support"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                tab === t
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "menu" && "Menu"}
              {t === "order" && "Place Order"}
              {t === "orders" && "My Orders"}
              {t === "rewards" && "Rewards"}
              {t === "support" && "Support"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {tab === "menu" && <MenuView data={menu.data} loading={menu.isLoading} />}
        {tab === "order" && <OrderView />}
        {tab === "orders" && <OrdersView orders={profile.data?.orders ?? []} />}
        {tab === "rewards" && (
          <RewardsView
            points={points}
            ledger={profile.data?.ledger ?? []}
          />
        )}
        {tab === "support" && <SupportView />}
      </main>
    </div>
  );
}

/* ---------------- Menu (reads cache) ---------------- */
function MenuView({
  data,
  loading,
}: {
  data: Awaited<ReturnType<typeof getMenu>> | undefined;
  loading: boolean;
}) {
  if (loading) return <p className="text-muted-foreground">Loading menu…</p>;
  const sections = data?.parsed?.sections ?? [];
  const fetched = data?.fetched_at ? new Date(data.fetched_at).toLocaleString() : "never";

  if (!sections.length) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <h2 className="text-2xl font-extrabold">Menu syncing…</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We pull the live menu every 2 hours from our drop sheet. Check back in a moment, or
          have an admin hit "Refresh now" on the admin dashboard.
        </p>
        {data?.error && (
          <p className="mt-3 text-xs text-red-300">Last sync error: {data.error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            The <span className="text-gradient-flame">Menu</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Updated automatically · last sync {fetched}
          </p>
        </div>
      </div>
      {sections.map((section, idx) => (
        <section key={`${section.title}-${idx}`} className="animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
              {section.title}
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.rows.map((row, ridx) => {
              const [name, ...rest] = row;
              const priceish = rest.find((s) => /\$|\d/.test(s));
              const others = rest.filter((s) => s !== priceish);
              return (
                <div
                  key={ridx}
                  className="group rounded-3xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg leading-tight">{name}</h3>
                    {priceish && (
                      <span className="shrink-0 rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-bold">
                        {priceish}
                      </span>
                    )}
                  </div>
                  {others.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {others.map((o, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-background/60 border border-border text-xs text-muted-foreground px-2.5 py-1"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------------- Order ---------------- */
function OrderView() {
  const qc = useQueryClient();
  const place = useServerFn(createOrder);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const m = useMutation({
    mutationFn: () => place({ data: { message, address, phone } }),
    onSuccess: () => {
      setMessage("");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-secondary/10 p-6 shadow-glow">
        <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
          Rewards
        </div>
        <h3 className="mt-2 text-2xl font-display font-extrabold">
          1 point per $5 spent · 100 pts unlocks a reward.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Make sure your phone number is correct — that's how we credit your points.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim().length < 3) return;
          m.mutate();
        }}
        className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card space-y-4"
      >
        <Field label="Phone (for rewards)" value={phone} onChange={setPhone} type="tel" />
        <Field label="Delivery address" value={address} onChange={setAddress} />
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Your order
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="e.g. 1 oz Top Shelf, 2 Boutiq V5 Orbs, 7g Hashers rosin. Paying Cash App."
            className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition resize-y"
          />
        </div>
        <button
          type="submit"
          disabled={m.isPending}
          className="w-full rounded-full bg-primary text-primary-foreground font-semibold py-3.5 shadow-glow hover:opacity-90 transition disabled:opacity-60"
        >
          {m.isPending ? "Submitting…" : "Submit order"}
        </button>
        {m.isError && (
          <p className="text-sm text-red-400">{(m.error as Error).message}</p>
        )}
        {m.isSuccess && (
          <p className="text-sm text-emerald-300 text-center">
            Order received. We'll text you at {phone || "your number"} to confirm. Want to
            text us directly too?{" "}
            <a
              href={`sms:+13156771426?&body=${encodeURIComponent(
                `Juanna World order\nPhone: ${phone}\nAddress: ${address}\nOrder: ${message}`,
              )}`}
              className="text-primary underline"
            >
              Open Messages
            </a>
          </p>
        )}
      </form>
    </div>
  );
}

function OrdersView({ orders }: { orders: any[] }) {
  if (!orders.length)
    return <p className="text-muted-foreground">No orders yet. Place your first one!</p>;
  return (
    <div className="space-y-3 max-w-3xl">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>#{o.id.slice(0, 8)}</span>
            <StatusBadge status={o.status} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {new Date(o.created_at).toLocaleString()}
          </div>
          {o.address && (
            <div className="mt-2 text-xs text-muted-foreground">→ {o.address}</div>
          )}
          <div className="mt-2 whitespace-pre-wrap text-sm">{o.message}</div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c =
    status === "delivered"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : status === "cancelled"
        ? "bg-red-500/15 text-red-300 border-red-500/40"
        : "bg-amber-500/15 text-amber-300 border-amber-500/40";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold ${c}`}>
      {status}
    </span>
  );
}

function RewardsView({ points, ledger }: { points: number; ledger: any[] }) {
  const pct = Math.min(100, (points / 100) * 100);
  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-secondary/10 p-7 shadow-glow">
        <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
          Your Points
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-6xl font-display font-extrabold text-gradient-flame">{points}</div>
          <div className="text-sm text-muted-foreground">/ 100</div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-background/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {points >= 100
            ? "Reward unlocked — text us to claim!"
            : `${100 - points} pts to your next reward. Earn 1 pt per $5 spent.`}
        </p>
      </div>
      <div>
        <h3 className="text-lg font-display font-extrabold mb-3">History</h3>
        {ledger.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reward activity yet. Points are added manually by an admin every day.
          </p>
        ) : (
          <div className="space-y-2">
            {ledger.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <div className="text-sm">{l.reason || "Manual adjustment"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </div>
                </div>
                <div
                  className={`font-display font-extrabold ${
                    l.points_delta >= 0 ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {l.points_delta > 0 ? "+" : ""}
                  {l.points_delta} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SupportView() {
  return (
    <div className="max-w-2xl space-y-4">
      <h3 className="text-2xl font-extrabold">Need a hand?</h3>
      <p className="text-sm text-muted-foreground">
        Text or call our support line. We'll reset passwords, handle issues, and answer fast.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <a
          href="sms:+13156771426"
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition"
        >
          <div className="text-xs uppercase tracking-widest text-secondary font-semibold">Text</div>
          <div className="mt-1 text-xl font-display font-extrabold">(315) 677-1426</div>
        </a>
        <a
          href="tel:+13156771426"
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition"
        >
          <div className="text-xs uppercase tracking-widest text-secondary font-semibold">Call</div>
          <div className="mt-1 text-xl font-display font-extrabold">(315) 677-1426</div>
        </a>
      </div>
      <a
        href={`sms:+13156771426?&body=${encodeURIComponent("Juanna World — password reset request. My username: ")}`}
        className="inline-block rounded-full bg-secondary text-secondary-foreground font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition"
      >
        Request password reset
      </a>
    </div>
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
        className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition"
      />
    </div>
  );
}
