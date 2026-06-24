import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/juanna-world-logo.png.asset.json";
const ORB_IMG_URL = "/IMG_0335.png";

const PHONE_RAW = "3156771426";
const PHONE_DISPLAY = "(315) 677-1426";
const SMS_HREF = `sms:+1${PHONE_RAW}?&body=${encodeURIComponent(
  "VERIFICATION(PLEASE INCLUDE PHOTO ID) — I'm 21+ and want the Juanna World menu password.",
)}`;
const TEL_HREF = `tel:+1${PHONE_RAW}`;
const ACCESS_PASSWORD = "Juannaw0r1d";
const ORBS_REEL = "https://www.instagram.com/reel/DVqlymUDLJi/?igsh=d2NucTRkMWU5b3Fh";

// Support number (same line for orders + password resets)
const SUPPORT_RAW = "3156771426";
const SUPPORT_DISPLAY = "(315) 677-1426";
const SUPPORT_SMS = `sms:+1${SUPPORT_RAW}?&body=${encodeURIComponent(
  "Juanna World — password reset request. My username: ",
)}`;

// Planet Fitness, Cortland NY (819 NY-13) — delivery origin
const ORIGIN_LAT = 42.5876;
const ORIGIN_LNG = -76.1518;
const DELIVERY_RADIUS_MI = 40;

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

  const glow =
    status === "open"
      ? "shadow-[0_0_12px_rgba(52,211,153,0.6)]"
      : status === "preorder"
        ? "shadow-[0_0_12px_rgba(251,191,36,0.5)]"
        : "";

  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
      <span
        className={`relative flex h-2.5 w-2.5 ${status === "open" ? "animate-pulse" : ""}`}
      >
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75 ${glow}`}
          style={
            status === "open"
              ? { animation: "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite" }
              : undefined
          }
        />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
      </span>
      <span className="text-foreground font-semibold">{label}</span>
      <span className="hidden sm:inline text-muted-foreground">· Mon–Sat 10am–6pm</span>
    </span>
  );
}

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
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("jw_unlocked") === "1") setUnlocked(true);
    const u = sessionStorage.getItem("jw_user");
    if (u) setUser(u);
  }, []);

  const signOut = () => {
    sessionStorage.removeItem("jw_user");
    setUser(null);
  };

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;
  if (!user) return <AccountGate onAuth={(u: string) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav user={user} onSignOut={signOut} />
      <Hero />
      <Eligibility />
      <Stats />
      <Menu />
      <Orbs />
      <Wholesale />
      <Payments />
      <OrderMessage user={user} />
      <Verify />
      <Footer />
    </div>
  );
}

/* ---------------- Access Gate (phone + password) ---------------- */
function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.trim() === ACCESS_PASSWORD) {
      sessionStorage.setItem("jw_unlocked", "1");
      setErr(null);
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
            <img
              src={logo.url}
              alt="Juanna World"
              className="w-28 h-28 mx-auto drop-shadow-2xl animate-float"
            />
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
            <div className="mt-2 text-3xl md:text-4xl font-display font-extrabold">
              {PHONE_DISPLAY}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Text us — confirm you're 21+ and we'll reply with the menu password.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <a
                href={SMS_HREF}
                className="flex-1 rounded-full bg-primary text-primary-foreground font-semibold px-5 py-3 text-center shadow-glow hover:opacity-90 transition"
              >
                Text to Verify
              </a>
              <a
                href={TEL_HREF}
                className="flex-1 rounded-full border border-border bg-card px-5 py-3 font-semibold text-center hover:bg-muted transition"
              >
                Save Contact
              </a>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card"
          >
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
            {err && (
              <p className="mt-2 text-sm text-red-400">{err}</p>
            )}
            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-primary text-primary-foreground font-semibold py-3 shadow-glow hover:opacity-90 transition"
            >
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
function Nav({ user, onSignOut }: { user: string; onSignOut: () => void }) {
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
          <a href="#order" className="hover:text-foreground transition">Order</a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-muted-foreground">
            Hi, <span className="text-foreground font-semibold">{user}</span>
          </span>
          <button
            onClick={onSignOut}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
          >
            Sign out
          </button>
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
            <a
              href={SMS_HREF}
              className="rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow hover:opacity-90 transition"
            >
              Text {PHONE_DISPLAY}
            </a>
            <a
              href="#menu"
              className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold hover:bg-muted transition"
            >
              See the menu
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            21+ only. Verified members only.
          </p>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-br from-primary/50 to-secondary/40 rounded-full" />
          <img
            src={logo.url}
            alt="Juanna World logo"
            className="relative w-72 md:w-[26rem] animate-float drop-shadow-2xl"
          />
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
            <div className="text-3xl md:text-4xl font-display font-extrabold text-gradient-flame">
              {i.k}
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
              {i.v}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Dynamic Menu (Auto-updates from Google Doc every 2 hours) ---------------- */
type MenuSection = {
  title: string;
  description?: string;
  items: Array<{
    name: string;
    price?: string;
    desc?: string;
    strains?: string[];
    soldOut?: boolean;
    isOrbs?: boolean;
  }>;
};

const GOOGLE_DOC_URL = "https://docs.google.com/document/u/2/d/1-L_txxNtkd_cHb08kQMO7FpLn-tk9wXM4lo7wcK5DdE/export?format=txt";

async function fetchAndParseMenu(): Promise<MenuSection[]> {
  try {
    const res = await fetch(GOOGLE_DOC_URL + "&t=" + Date.now());
    if (!res.ok) throw new Error("Failed");
    const text = await res.text();

    const sections: MenuSection[] = [];
    const lines = text.split('\n');
    let current: MenuSection | null = null;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('[') && line.endsWith(']')) {
        if (current) sections.push(current);
        current = { title: line.slice(1, -1).trim(), items: [] };
        continue;
      }

      if (!current) continue;

      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        current.items.push({
          name: parts[0],
          price: parts[1],
          desc: parts[2],
        });
      } else if (line.toLowerCase().includes("strains:")) {
        const strainsText = line.replace(/strains?:/i, '').trim();
        if (current.items.length > 0) {
          current.items[current.items.length - 1].strains = strainsText.split(',').map(s => s.trim());
        }
      } else if (line.toLowerCase().includes("sold out")) {
        if (current.items.length > 0) {
          current.items[current.items.length - 1].soldOut = true;
        }
      } else if (current.title.toLowerCase().includes("vapes") || current.title.toLowerCase().includes("orbs")) {
        current.items.push({ name: line, isOrbs: true });
      } else if (!current.description) {
        current.description = line;
      }
    }

    if (current) sections.push(current);
    return sections.length > 0 ? sections : getFallbackMenu();
  } catch (e) {
    console.error("Menu fetch failed:", e);
    return getFallbackMenu();
  }
}

function getFallbackMenu(): MenuSection[] {
  return [{
    title: "TIER 1 - TOP SHELF",
    description: "Loud, hand-trimmed, exotic strain rotation.",
    items: [{ name: "Loading live menu from Google Doc..." }]
  }];
}

function Menu() {
  const [menuData, setMenuData] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndParseMenu().then(data => {
      setMenuData(data);
      setLoading(false);
    });
  }, []);

  // Auto-refresh every 2 hours
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndParseMenu().then(data => {
        if (data.length > 0) setMenuData(data);
      });
    }, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="menu" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHeader
          eyebrow="The Menu"
          title="Live Menu • Updates Every 2 Hours"
          sub="Parsed directly from our master Google Doc. Always current."
        />

        <div className="mt-12 space-y-16">
          {loading ? (
            <div className="text-center py-20">Loading latest menu...</div>
          ) : (
            menuData.map((section, idx) => (
              <div key={idx}>
                <div className="mb-8">
                  <h3 className="text-3xl font-display font-extrabold tracking-tight">{section.title}</h3>
                  {section.description && <p className="mt-3 text-muted-foreground text-lg">{section.description}</p>}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className={`group rounded-3xl border p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-xl ${item.soldOut ? 'opacity-75' : 'hover:border-primary/50'}`}
                    >
                      {item.soldOut && (
                        <div className="inline-block mb-3 rounded-full bg-red-500/10 px-3 py-1

/* ---------------- Orbs (2g Disposable Vape) ---------------- */
function Orbs() {
  return (
    <section id="orbs" className="py-20 md:py-24 bg-card/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeader
            eyebrow="Vapes"
            title="Boutiq V5 Orbs"
            sub="$50 each — 2g all-in-one disposable vape."
          />
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">What they are:</strong> The Boutiq V5 Orb is a
              fully <strong className="text-foreground">disposable 2-gram vape</strong> — no cart, no battery to charge separately, no buttons. You pull straight
              from the device and toss it when it's done.
            </p>
            <p>
              Each Orb is filled with <strong className="text-foreground">2 grams of live-resin
              cannabis oil</strong> — strain-specific, high-terpene, and made without cutting
              agents like PG, VG, or MCT. The V5 generation upgrades the hardware: improved
              airflow, a bigger built-in battery to actually finish the full 2g, and a smoother
              draw than older pod systems.
            </p>
            <p>
              Translation: <em className="text-foreground">discreet, potent, full-flavor — open
              the box, rip it, throw it away when empty.</em>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={ORBS_REEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-5 py-3 shadow-glow hover:opacity-90 transition"
            >
              ▶ Watch the Orb in action
            </a>
            <a
              href={SMS_HREF}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-semibold hover:bg-muted transition"
            >
             Grab one Now! — $50
            </a>
          </div>
        </div>
        <div className="relative max-w-md mx-auto w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-primary/20 to-secondary/30 rounded-full blur-3xl" />
          <div className="relative rounded-3xl border border-border bg-background/40 backdrop-blur overflow-hidden">
            <img
              src={ORB_IMG_URL}
              alt="Boutiq V5 Orb 2g disposable vape"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-4 right-4 rounded-full bg-primary text-primary-foreground text-sm font-bold px-4 py-2 shadow-glow">
              $50 / orb
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Wholesale ---------------- */
function Wholesale() {
  return (
    <section id="wholesale" className="py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-5">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/20 via-card to-primary/10 p-8 md:p-14 shadow-card">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">
                Bulk Buyers
              </div>
              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">
                Larger wholesale menu available.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl">
                Moving units? We carry a deeper wholesale catalog — pricing scales with volume.
                Text us for the full sheet, references, and current drops.
              </p>
            </div>
            <div className="flex md:justify-end">
              <a
                href={SMS_HREF}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold px-7 py-4 shadow-glow hover:opacity-90 transition"
              >
                Request Wholesale Menu
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Verify ---------------- */
function Verify() {
  const steps = [
    {
      n: "01",
      t: "Text us",
      d: `Send a quick text to ${PHONE_DISPLAY} from your phone — that becomes your verified line.`,
    },
    {
      n: "02",
      t: "Confirm 21+",
      d: "Reply with your name and confirm you're 21 or older. We'll verify and add you to the list.",
    },
    {
      n: "03",
      t: "Order & deliver",
      d: "Tell us what you want and where you are. We deliver within 35 miles of Cortland, NY.",
    },
  ];
  return (
    <section id="verify" className="py-20 md:py-28 bg-card/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHeader
          eyebrow="Get Verified"
          title="Text to verify. Then you're in."
          sub="No app, no signup. Just a quick text and you're on the list."
        />
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-3xl border border-border bg-card p-7 shadow-card"
            >
              <div className="text-5xl font-display font-extrabold text-gradient-flame">
                {s.n}
              </div>
              <h3 className="mt-3 text-xl">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-secondary/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
              Verification Line
            </div>
            <div className="mt-2 text-4xl md:text-5xl font-display font-extrabold">
              {PHONE_DISPLAY}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Text only — calls will not be answered for new orders.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={SMS_HREF}
              className="rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3.5 text-center shadow-glow hover:opacity-90 transition"
            >
              Text to Verify
            </a>
            <a
              href={TEL_HREF}
              className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold text-center hover:bg-muted transition"
            >
              Save Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Payments ---------------- */
function Payments() {
  const methods = [
    {
      name: "Cash App",
      tag: "$JuannaWorld",
      d: "Send as 'Friends' with no note about product. Screenshot the receipt and text it in to confirm your drop.",
      accent: "from-emerald-400 to-green-600",
      icon: "$",
    },
    {
      name: "PayPal",
      tag: "Friends & Family only",
      d: "Request our handle when you text to verify. Send F&F — no item description. Forward the confirmation email or screenshot.",
      accent: "from-sky-400 to-blue-600",
      icon: "P",
    },
    {
      name: "Cash on Delivery",
      tag: "Exact change preferred Must Have Extra Verification",
      d: "Pay your driver in cash at the door. Have ID ready (21+). Tips appreciated and go straight to the driver.",
      accent: "from-amber-400 to-orange-600",
      icon: "$",
    },
  ];

  return (
    <section id="payments" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHeader
          eyebrow="Checkout"
          title="Pay your way."
          sub="Three easy options. Lock in your order over text — we'll confirm payment details before the driver rolls out."
        />
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {methods.map((m) => (
            <div
              key={m.name}
              className="rounded-3xl border border-border bg-card/60 p-7 hover:border-primary/40 transition group"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.accent} flex items-center justify-center text-2xl font-extrabold text-white shadow-glow mb-5`}
              >
                {m.icon}
              </div>
              <div className="font-display text-2xl font-bold">{m.name}</div>
              <div className="text-xs uppercase tracking-widest text-primary mt-1">{m.tag}</div>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">{m.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-border/60 bg-card/30 p-5 text-xs text-muted-foreground text-center">
          Digital payments must be sent as <span className="text-foreground font-semibold">Friends & Family</span> with
          no product references. Orders are on the way after payment is confirmed (COD excluded).
        </div>
      </div>
    </section>
  );
}


/* ---------------- Footer ---------------- */
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
              <div className="text-xs text-muted-foreground">
                Cannabis delivery · Cortland, NY · 35 mi radius
              </div>
            </div>
          </div>
          <a
            href={SMS_HREF}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Text {PHONE_DISPLAY}
          </a>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground leading-relaxed max-w-3xl">
          21+ only. By using this site you confirm you are of legal age. Juanna World does not
          ship cannabis products. All transactions, when applicable, are conducted in compliance
          with New York State law between verified adults. Please consume responsibly and never
          drive impaired.
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Juanna World. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Account Gate (signup / login) ---------------- */
type Account = { password: string; createdAt: number; orders: StoredOrder[] };
type StoredOrder = { id: string; at: number; message: string; address: string };

function loadAccounts(): Record<string, Account> {
  try {
    return JSON.parse(localStorage.getItem("jw_accounts") || "{}");
  } catch {
    return {};
  }
}
function saveAccounts(a: Record<string, Account>) {
  localStorage.setItem("jw_accounts", JSON.stringify(a));
}

async function hashPw(pw: string): Promise<string> {
  const buf = new TextEncoder().encode(pw + "::jw-salt-v1");
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function AccountGate({ onAuth }: { onAuth: (username: string) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const u = username.trim().toLowerCase();
    if (!u || u.length < 3) return setErr("Username must be at least 3 characters.");
    if (!/^[a-z0-9_.-]+$/.test(u))
      return setErr("Letters, numbers, dot, dash, underscore only.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");

    setBusy(true);
    try {
      const accounts = loadAccounts();
      const hashed = await hashPw(pw);
      if (mode === "signup") {
        if (accounts[u]) {
          setErr("That username already exists. Try logging in.");
          return;
        }
        accounts[u] = { password: hashed, createdAt: Date.now(), orders: [] };
        saveAccounts(accounts);
      } else {
        if (!accounts[u] || accounts[u].password !== hashed) {
          setErr("Wrong username or password.");
          return;
        }
      }
      sessionStorage.setItem("jw_user", u);
      onAuth(u);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero text-foreground flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <img src={logo.url} alt="Juanna World" className="w-24 h-24 mx-auto drop-shadow-2xl" />
            <h1 className="mt-5 text-3xl md:text-4xl font-extrabold">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account stores your order history & info on this device.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card space-y-4"
          >
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="yourname"
                className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Password
              </label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition"
              />
            </div>
            {err && <p className="text-sm text-red-400">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-primary text-primary-foreground font-semibold py-3 shadow-glow hover:opacity-90 transition disabled:opacity-60"
            >
              {busy ? "..." : mode === "signup" ? "Create account" : "Log in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setErr(null);
                setMode(mode === "signup" ? "login" : "signup");
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              {mode === "signup"
                ? "Already have an account? Log in"
                : "New here? Create an account"}
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-border bg-card/60 p-5 text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-secondary font-semibold">
              Forgot password?
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Text our support line and we'll get you back in.
            </p>
            <a
              href={SUPPORT_SMS}
              className="mt-3 inline-block rounded-full bg-secondary text-secondary-foreground font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition"
            >
              Text Support · {SUPPORT_DISPLAY}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Eligibility (distance from Planet Fitness Cortland) ---------------- */
function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
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
      const data = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (!data.length) {
        setResult({ ok: false, error: "Couldn't find that address. Try adding city + state." });
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      const miles = haversineMiles(ORIGIN_LAT, ORIGIN_LNG, lat, lng);
      setResult({
        ok: true,
        miles,
        label: data[0].display_name,
        eligible: miles <= DELIVERY_RADIUS_MI,
      });
    } catch {
      setResult({ ok: false, error: "Network error. Try again in a sec." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="eligibility" className="py-16 md:py-20 border-b border-border">
      <div className="max-w-3xl mx-auto px-5">
        <SectionHeader
          eyebrow="Delivery Check"
          title="Are you in our zone?"
          sub={`We deliver within ${DELIVERY_RADIUS_MI} miles of Planet Fitness in Cortland, NY. Drop your address to see if we can roll to you.`}
        />
        <form
          onSubmit={check}
          className="mt-8 rounded-3xl border border-border bg-card p-5 md:p-6 shadow-card"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              placeholder="123 Main St, Cortland, NY"
              className="flex-1 rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow hover:opacity-90 transition disabled:opacity-60"
            >
              {busy ? "Checking..." : "Check delivery"}
            </button>
          </div>
          {result && (
            <div
              className={`mt-5 rounded-2xl border p-4 text-sm ${
                result.ok
                  ? result.eligible
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                  : "border-red-500/40 bg-red-500/10 text-red-200"
              }`}
            >
              {result.ok ? (
                result.eligible ? (
                  <>
                    <div className="font-display font-extrabold text-lg">
                      ✓ You're in. {result.miles.toFixed(1)} mi away.
                    </div>
                    <div className="opacity-80 mt-1 text-xs">{result.label}</div>
                  </>
                ) : (
                  <>
                    <div className="font-display font-extrabold text-lg">
                      Out of zone — {result.miles.toFixed(1)} mi away.
                    </div>
                    <div className="opacity-80 mt-1 text-xs">
                      We only deliver within {DELIVERY_RADIUS_MI} mi of Cortland.
                    </div>
                  </>
                )
              ) : (
                <div>{result.error}</div>
              )}
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Address lookup via OpenStreetMap. Your address isn't saved unless you add it to an order.
          </p>
        </form>
      </div>
    </section>
  );
}

/* ---------------- Order Message (text the kitchen) ---------------- */
function OrderMessage({ user }: { user: string }) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    const a = loadAccounts();
    setOrders(a[user]?.orders ?? []);
  }, [user]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) return;
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Please enter your phone number — required for rewards points.");
      return;
    }
    const order: StoredOrder = {
      id: Math.random().toString(36).slice(2, 10),
      at: Date.now(),
      message: message.trim(),
      address: address.trim(),
    };
    const a = loadAccounts();
    if (a[user]) {
      a[user].orders = [order, ...(a[user].orders ?? [])].slice(0, 50);
      saveAccounts(a);
      setOrders(a[user].orders);
    }
    const body =
      `Juanna World order from @${user}\n\n` +
      `Phone (for rewards points): ${cleanPhone}\n` +
      `Address: ${address.trim() || "(not provided)"}\n\n` +
      `Order: ${message.trim()}`;
    const href = `sms:+1${PHONE_RAW}?&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSent(true);
    setMessage("");
  };



  return (
    <section id="order" className="py-20 md:py-24 border-t border-border">
      <div className="max-w-4xl mx-auto px-5">
        <SectionHeader
          eyebrow="Place an Order"
          title="Send your order straight to us."
          sub={`Type what you want and your address — we'll text you back at the verified number to confirm. Goes to ${PHONE_DISPLAY}.`}
        />
        <div className="mt-8 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-secondary/10 p-6 shadow-glow">
          <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
            Rewards Program
          </div>
          <h3 className="mt-2 text-2xl font-display font-extrabold">
            Earn 1 point for every $5 spent.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Hit <span className="text-foreground font-semibold">100 points ($500 spent)</span> and
            pick a reward from our rewards list. Points are tracked by phone number and added
            manually every day — <span className="text-foreground font-semibold">you must include
            your phone number in the order notes below</span> to get credit.
          </p>
        </div>
        <form
          onSubmit={send}
          className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card space-y-4"
        >
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Phone number <span className="text-primary">(required for rewards)</span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(315) 555-0123"
              className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Delivery address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Cortland, NY"
              className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Your order
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="e.g. 1 oz Top Shelf, 2 Boutiq V5 Orbs, 7g Hashers rosin. Paying with Cash App."
              className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition resize-y"
            />
            <div className="mt-1 text-[11px] text-muted-foreground text-right">
              {message.length}/1000
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary text-primary-foreground font-semibold py-3.5 shadow-glow hover:opacity-90 transition"
          >
            Send order via text
          </button>
          {sent && (
            <p className="text-xs text-emerald-300 text-center">
              Opened your messages app. Hit send to deliver the order to {PHONE_DISPLAY}.
            </p>
          )}
        </form>

        {orders.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-display font-extrabold">Your recent orders</h3>
            <div className="mt-4 space-y-3">
              {orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-border bg-card/60 p-4 text-sm"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>#{o.id}</span>
                    <span>{new Date(o.at).toLocaleString()}</span>
                  </div>
                  {o.address && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      → {o.address}
                    </div>
                  )}
                  <div className="mt-2 whitespace-pre-wrap text-foreground">{o.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
