import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import logo from "@/assets/juanna-world-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { getMenu } from "@/lib/menu.functions";

const ORB_IMG_URL = "/IMG_0335.png";
const PHONE_RAW = "3156771426";
const PHONE_DISPLAY = "(315) 677-1426";
const SMS_HREF = `sms:+1${PHONE_RAW}?&body=${encodeURIComponent(
  "VERIFICATION(PLEASE INCLUDE PHOTO ID) — I'm 21+ and want the Juanna World menu password.",
)}`;
const TEL_HREF = `tel:+1${PHONE_RAW}`;
const ACCESS_PASSWORD = "Juannaw0r1d";
const ORBS_REEL = "https://www.instagram.com/reel/DVqlymUDLJi/?igsh=d2NucTRkMWU5b3Fh";
const ORIGIN_LAT = 42.5876;
const ORIGIN_LNG = -76.1518;
const DELIVERY_RADIUS_MI = 40;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Juanna World — Cannabis Delivery in Cortland, NY" },
      {
        name: "description",
        content:
          "Verified members only. Text to verify and receive the Juanna World menu password. Delivery within 35 miles of Cortland, NY.",
      },
      { property: "og:title", content: "Juanna World — Cannabis Delivery" },
      {
        property: "og:description",
        content: "Text to verify. Members-only menu. 35 mi around Cortland, NY.",
      },
      { property: "og:image", content: logo.url },
      { name: "twitter:image", content: logo.url },
    ],
  }),
  component: Home,
});

function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [session, setSession] = useState<{ email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("jw_unlocked") === "1") setUnlocked(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.user ? { email: data.user.email } : null);
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        if (mounted) setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s?.user ? { email: s.user.email } : null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav session={session} isAdmin={isAdmin} />
      <Hero />
      <Eligibility />
      <Stats />
      <Menu />
      <Orbs />
      <Wholesale />
      <Payments />
      <Verify session={session} />
      <Footer />
    </div>
  );
}

/* ---------------- Delivery status ---------------- */
function DeliveryStatus() {
  const [status, setStatus] = useState<"open" | "preorder" | "closed">("closed");
  const [label, setLabel] = useState("");
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekday = day >= 1 && day <= 6;
    if (isWeekday && hour >= 10 && hour < 18) {
      setStatus("open");
      setLabel("Delivering Now · 10am–6pm");
    } else if (day === 0) {
      setStatus("preorder");
      setLabel("Sunday Preorders · Text to schedule");
    } else {
      setStatus("closed");
      const nextOpen = isWeekday && hour >= 18 ? "tomorrow at 10am" : "10am";
      setLabel(`Closed · Back ${nextOpen}`);
    }
  }, []);
  const dotColor =
    status === "open"
      ? "bg-emerald-400"
      : status === "preorder"
        ? "bg-amber-400"
        : "bg-muted-foreground";
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
      <span className={`relative flex h-2.5 w-2.5 ${status === "open" ? "animate-pulse" : ""}`}>
        <span className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
      </span>
      <span className="text-foreground font-semibold">{label}</span>
      <span className="hidden sm:inline text-muted-foreground">· Mon–Sat 10am–6pm</span>
    </span>
  );
}

/* ---------------- Gate ---------------- */
function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.trim() === ACCESS_PASSWORD) {
      sessionStorage.setItem("jw_unlocked", "1");
      onUnlock();
    } else {
      setErr("Incorrect password. Text to verify and request access.");
    }
  };
  return (
    <div className="min-h-screen bg-hero text-foreground flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <img src={logo.url} alt="Juanna World" className="w-28 h-28 mx-auto drop-shadow-2xl animate-float" />
            <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
              Juanna <span className="text-gradient-flame">World</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Members-only cannabis delivery · 35 mi around Cortland, NY
            </p>
          </div>
          <div className="mt-8 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-secondary/10 p-6 shadow-glow text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
              Step 1 · Text to Verify
            </div>
            <div className="mt-2 text-3xl md:text-4xl font-display font-extrabold">{PHONE_DISPLAY}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Text us — confirm you're 21+ and we'll reply with the menu password.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <a href={SMS_HREF} className="flex-1 rounded-full bg-primary text-primary-foreground font-semibold px-5 py-3 text-center shadow-glow hover:opacity-90 transition">
                Text to Verify
              </a>
              <a href={TEL_HREF} className="flex-1 rounded-full border border-border bg-card px-5 py-3 font-semibold text-center hover:bg-muted transition">
                Save Contact
              </a>
            </div>
          </div>
          <form onSubmit={submit} className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
            <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              Step 2 · Enter Password
            </label>
            <input
              type="password"
              autoComplete="off"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Menu password"
              className="mt-3 w-full rounded-xl bg-background border border-border px-4 py-3 text-base outline-none focus:border-primary transition"
            />
            {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
            <button type="submit" className="mt-4 w-full rounded-full bg-primary text-primary-foreground font-semibold py-3 shadow-glow hover:opacity-90 transition">
              Unlock Menu
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center leading-relaxed">
              21+ only. By unlocking you confirm you are of legal age in New York State.
            </p>
          </form>
        </div>
      </div>
      <footer className="px-5 pb-8 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} Juanna World · Cortland, NY
      </footer>
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav({
  session,
  isAdmin,
}: {
  session: { email?: string } | null;
  isAdmin: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo.url} alt="" className="w-10 h-10" />
          <span className="font-display font-extrabold text-lg tracking-tight">
            Juanna <span className="text-gradient-flame">World</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#eligibility" className="hover:text-foreground transition">Delivery</a>
          <a href="#menu" className="hover:text-foreground transition">Menu</a>
          <a href="#orbs" className="hover:text-foreground transition">Orbs</a>
          <a href="#payments" className="hover:text-foreground transition">Payment</a>
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin" className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-glow">
              Admin
            </Link>
          )}
          {session ? (
            <Link to="/dashboard" className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold shadow-glow">
              Dashboard
            </Link>
          ) : (
            <Link to="/auth" className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold shadow-glow">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section id="top" className="relative bg-hero">
      <div className="max-w-6xl mx-auto px-5 pt-14 pb-20 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <DeliveryStatus />
          <h1 className="mt-5 text-5xl md:text-7xl font-extrabold leading-[0.95]">
            Top-shelf <span className="text-gradient-flame">delivered</span> to your door.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">
            Flower, non-CRC live resin, Hashers Anonymous live rosin, and Boutiq V5 disposables.
            Discreet, fast, and curated by smokers for the smokers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow hover:opacity-90 transition"
            >
              Create account · Order online
            </Link>
            <a href="#menu" className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold hover:bg-muted transition">
              See the menu
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">21+ only. Verified members only.</p>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-br from-primary/50 to-secondary/40 rounded-full" />
          <img src={logo.url} alt="Juanna World logo" className="relative w-72 md:w-[26rem] animate-float drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { k: "35mi", v: "Delivery radius" },
    { k: "21+", v: "Verified only" },
    { k: "100%", v: "Curated drops" },
    { k: "7 days", v: "Open weekly" },
  ];
  return (
    <section className="border-y border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((i) => (
          <div key={i.v} className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-display font-extrabold text-gradient-flame">{i.k}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{i.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Menu (dynamic from cache) ---------------- */
function Menu() {
  const fetchMenu = useServerFn(getMenu);
  const menu = useQuery({ queryKey: ["menu"], queryFn: () => fetchMenu() });
  const sections = menu.data?.parsed?.sections ?? [];

  return (
    <section id="menu" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHeader
          eyebrow="The Menu"
          title="What's in stock."
          sub="Auto-synced from our live drop sheet every 2 hours."
        />

        {menu.isLoading && (
          <p className="mt-10 text-muted-foreground">Loading menu…</p>
        )}

        {!menu.isLoading && sections.length === 0 && (
          <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Menu syncing — text {PHONE_DISPLAY} for today's drops while we refresh.
            </p>
          </div>
        )}

        <div className="mt-10 space-y-14">
          {sections.map((section, i) => (
            <div key={`${section.title}-${i}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
                  {section.title}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {section.rows.map((row, ridx) => {
                  const [name, ...rest] = row;
                  const priceish = rest.find((s) => /\$|\d/.test(s));
                  const others = rest.filter((s) => s !== priceish);
                  const highlight = ridx === 0 && i === 0;
                  return (
                    <div
                      key={ridx}
                      className={`relative rounded-3xl border p-7 shadow-card transition hover:-translate-y-1 ${
                        highlight
                          ? "bg-gradient-to-br from-primary/15 to-secondary/10 border-primary/40"
                          : "bg-card border-border"
                      }`}
                    >
                      {highlight && (
                        <span className="absolute -top-3 left-7 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                          Top of section
                        </span>
                      )}
                      <h3 className="text-2xl pr-16">{name}</h3>
                      {priceish && (
                        <div className="absolute top-7 right-7 rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-bold">
                          {priceish}
                        </div>
                      )}
                      {others.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {others.map((o, oi) => (
                            <span
                              key={oi}
                              className="rounded-full bg-background/40 border border-border text-xs text-muted-foreground px-2.5 py-1"
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
            </div>
          ))}
        </div>

        {menu.data?.fetched_at && (
          <p className="mt-10 text-[11px] text-muted-foreground text-center">
            Last menu sync: {new Date(menu.data.fetched_at).toLocaleString()}
          </p>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">{eyebrow}</div>
      <h2 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ---------------- Orbs ---------------- */
function Orbs() {
  return (
    <section id="orbs" className="py-20 md:py-24 bg-card/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeader eyebrow="Vapes" title="Boutiq V5 Orbs" sub="$50 each — 2g all-in-one disposable vape." />
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">What they are:</strong> The Boutiq V5 Orb is a fully{" "}
              <strong className="text-foreground">disposable 2-gram vape</strong> — no cart, no battery to charge separately, no buttons.
            </p>
            <p>
              Each Orb is filled with <strong className="text-foreground">2 grams of live-resin cannabis oil</strong> — strain-specific, high-terpene, no cutting agents.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={ORBS_REEL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-5 py-3 shadow-glow hover:opacity-90 transition">
              ▶ Watch the Orb in action
            </a>
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-semibold hover:bg-muted transition">
              Order one — $50
            </Link>
          </div>
        </div>
        <div className="relative max-w-md mx-auto w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-primary/20 to-secondary/30 rounded-full blur-3xl" />
          <div className="relative rounded-3xl border border-border bg-background/40 backdrop-blur overflow-hidden">
            <img src={ORB_IMG_URL} alt="Boutiq V5 Orb 2g disposable vape" className="w-full h-auto object-cover" loading="lazy" />
            <div className="absolute bottom-4 right-4 rounded-full bg-primary text-primary-foreground text-sm font-bold px-4 py-2 shadow-glow">
              $50 / orb
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Wholesale() {
  return (
    <section id="wholesale" className="py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-5">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/20 via-card to-primary/10 p-8 md:p-14 shadow-card">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Bulk Buyers</div>
              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">Larger wholesale menu available.</h2>
              <p className="mt-4 text-muted-foreground max-w-xl">
                Moving units? We carry a deeper wholesale catalog — pricing scales with volume. Text us for the full sheet.
              </p>
            </div>
            <div className="flex md:justify-end">
              <a href={SMS_HREF} className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold px-7 py-4 shadow-glow hover:opacity-90 transition">
                Request Wholesale Menu
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Payments() {
  const methods = [
    { name: "Cash App", tag: "$JuannaWorld", d: "Send as 'Friends' with no note about product. Screenshot the receipt and text it in to confirm your drop.", accent: "from-emerald-400 to-green-600", icon: "$" },
    { name: "PayPal", tag: "Friends & Family only", d: "Request our handle when you text to verify. Send F&F — no item description.", accent: "from-sky-400 to-blue-600", icon: "P" },
    { name: "Cash on Delivery", tag: "Exact change preferred", d: "Pay your driver in cash at the door. Have ID ready (21+). Tips appreciated.", accent: "from-amber-400 to-orange-600", icon: "$" },
  ];
  return (
    <section id="payments" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHeader eyebrow="Checkout" title="Pay your way." sub="Three easy options." />
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {methods.map((m) => (
            <div key={m.name} className="rounded-3xl border border-border bg-card/60 p-7 hover:border-primary/40 transition group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.accent} flex items-center justify-center text-2xl font-extrabold text-white shadow-glow mb-5`}>
                {m.icon}
              </div>
              <div className="font-display text-2xl font-bold">{m.name}</div>
              <div className="text-xs uppercase tracking-widest text-primary mt-1">{m.tag}</div>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">{m.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Verify({ session }: { session: { email?: string } | null }) {
  return (
    <section id="verify" className="py-20 md:py-28 bg-card/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHeader eyebrow="Order Now" title="Already verified?" sub="Sign in to your account to place orders, see history, and track rewards points." />
        <div className="mt-10 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-secondary/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
              {session ? "Signed in" : "Account access"}
            </div>
            <div className="mt-2 text-3xl md:text-4xl font-display font-extrabold">
              {session ? "Go to your dashboard →" : "Create your account →"}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {session
                ? "Place orders, track delivery status, and watch your rewards points add up."
                : "Sign up with the same phone number you texted from to start earning rewards."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to={session ? "/dashboard" : "/auth"}
              className="rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3.5 text-center shadow-glow hover:opacity-90 transition"
            >
              {session ? "Open Dashboard" : "Sign in / Sign up"}
            </Link>
            <a href={SMS_HREF} className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold text-center hover:bg-muted transition">
              Or text {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-14">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="" className="w-12 h-12" />
            <div>
              <div className="font-display font-extrabold text-lg">
                Juanna <span className="text-gradient-flame">World</span>
              </div>
              <div className="text-xs text-muted-foreground">Cannabis delivery · Cortland, NY · 35 mi radius</div>
            </div>
          </div>
          <a href={SMS_HREF} className="text-sm text-muted-foreground hover:text-foreground transition">
            Text {PHONE_DISPLAY}
          </a>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground leading-relaxed max-w-3xl">
          21+ only. By using this site you confirm you are of legal age. Juanna World does not ship cannabis products. All transactions, when applicable, are conducted in compliance with New York State law between verified adults. Please consume responsibly and never drive impaired.
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Juanna World. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Eligibility ---------------- */
function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function Eligibility() {
  const [addr, setAddr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    | { ok: true; miles: number; label: string; eligible: boolean }
    | { ok: false; error: string }
    | null
  >(null);
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = addr.trim();
    if (q.length < 5) {
      setResult({ ok: false, error: "Please enter a full street address." });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (!data.length) {
        setResult({ ok: false, error: "Couldn't find that address. Try adding city + state." });
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      const miles = haversineMiles(ORIGIN_LAT, ORIGIN_LNG, lat, lng);
      setResult({ ok: true, miles, label: data[0].display_name, eligible: miles <= DELIVERY_RADIUS_MI });
    } catch {
      setResult({ ok: false, error: "Network error. Try again in a sec." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <section id="eligibility" className="py-16 md:py-20 border-b border-border">
      <div className="max-w-3xl mx-auto px-5">
        <SectionHeader eyebrow="Delivery Check" title="Are you in our zone?" sub={`We deliver within ${DELIVERY_RADIUS_MI} miles of Planet Fitness in Cortland, NY.`} />
        <form onSubmit={check} className="mt-8 rounded-3xl border border-border bg-card p-5 md:p-6 shadow-card">
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="123 Main St, Cortland, NY" className="flex-1 rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition" />
            <button type="submit" disabled={busy} className="rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow hover:opacity-90 transition disabled:opacity-60">
              {busy ? "Checking..." : "Check delivery"}
            </button>
          </div>
          {result && (
            <div className={`mt-5 rounded-2xl border p-4 text-sm ${result.ok ? (result.eligible ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100" : "border-amber-500/40 bg-amber-500/10 text-amber-100") : "border-red-500/40 bg-red-500/10 text-red-200"}`}>
              {result.ok ? (
                result.eligible ? (
                  <>
                    <div className="font-display font-extrabold text-lg">✓ You're in. {result.miles.toFixed(1)} mi away.</div>
                    <div className="opacity-80 mt-1 text-xs">{result.label}</div>
                  </>
                ) : (
                  <>
                    <div className="font-display font-extrabold text-lg">Out of zone — {result.miles.toFixed(1)} mi away.</div>
                    <div className="opacity-80 mt-1 text-xs">We only deliver within {DELIVERY_RADIUS_MI} mi of Cortland.</div>
                  </>
                )
              ) : (
                <div>{result.error}</div>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
