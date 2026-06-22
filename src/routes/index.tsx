import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/juanna-world-logo.png.asset.json";
const ORB_IMG_URL = "/IMG_0335.png";

const PHONE_RAW = "3156771426";
const PHONE_DISPLAY = "(315) 677-1426";
const SMS_HREF = `sms:+1${PHONE_RAW}?&body=${encodeURIComponent(
  "VERIFY — I'm 21+ and want the Juanna World menu password.",
)}`;
const TEL_HREF = `tel:+1${PHONE_RAW}`;
const ACCESS_PASSWORD = "Juannaw0r1d";
const ORBS_REEL = "https://www.instagram.com/reel/DTgMihvkixY/?igsh=d2JrM2o3ZjA0MTl0";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("jw_unlocked") === "1") setUnlocked(true);
  }, []);

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Stats />
      <Menu />
      <Orbs />
      <Wholesale />
      <Payments />
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
function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo.url} alt="" className="w-10 h-10" />
          <span className="font-display font-extrabold text-lg tracking-tight">
            Juanna <span className="text-gradient-flame">World</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#menu" className="hover:text-foreground transition">Menu</a>
          <a href="#orbs" className="hover:text-foreground transition">Orbs</a>
          <a href="#wholesale" className="hover:text-foreground transition">Wholesale</a>
          <a href="#payments" className="hover:text-foreground transition">Payment</a>
          <a href="#verify" className="hover:text-foreground transition">Verify</a>
        </nav>
        <a
          href={SMS_HREF}
          className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-glow"
        >
          Text to Order
        </a>
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
            Discreet, fast, and curated by people who actually smoke.
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

/* ---------------- Menu ---------------- */
type Tier = {
  name: string;
  tag: string;
  oz?: string;
  lb?: string;
  vibe: string;
  highlight?: boolean;
};

const flower: Tier[] = [
  {
    name: "Top Shelf",
    tag: "Tier 1",
    oz: "$120",
    lb: "$1,400",
    vibe: "Loud, hand-trimmed, exotic strain rotation.",
    highlight: true,
  },
  {
    name: "Mid Shelf",
    tag: "Tier 2",
    oz: "$100",
    lb: "$1,200",
    vibe: "Strong daily-driver flower at a working price.",
  },
  {
    name: "Pound Special",
    tag: "Tier 3",
    lb: "$900",
    vibe: "Bulk price. Solid smoke, unbeatable per-gram.",
  },
];

const concentrates = [
  {
    name: "Non-CRC Live Resin",
    sub: "Full-spectrum, no color remediation",
    price: "$120",
    unit: "/ oz",
    desc: "Pure terps, real color, real flavor. Nothing stripped out.",
  },
  {
    name: "Hashers Anonymous Live Rosin",
    sub: "Solventless · cold-cured",
    tiers: [
      { q: "1g", p: "$50" },
      { q: "7g", p: "$275" },
      { q: "14g", p: "$525" },
      { q: "28g", p: "$1,000" },
    ],
    desc: "Top-tier solventless rosin pressed from fresh-frozen hash.",
  },
];

function Menu() {
  return (
    <section id="menu" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHeader
          eyebrow="The Menu"
          title="Flower, in three tiers."
          sub="Three quality levels. Pick your price, we'll bring the heat."
        />
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {flower.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-3xl border p-7 shadow-card transition hover:-translate-y-1 ${
                t.highlight
                  ? "bg-gradient-to-br from-primary/15 to-secondary/10 border-primary/40"
                  : "bg-card border-border"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  Most Loved
                </span>
              )}
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t.tag}
              </div>
              <h3 className="mt-2 text-2xl">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.vibe}</p>
              <div className="mt-6 space-y-2 border-t border-border pt-4">
                {t.oz && <Row label="Ounce" value={t.oz} />}
                {t.lb && <Row label="Pound" value={t.lb} />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-5">
          {concentrates.map((c) => (
            <div
              key={c.name}
              className="rounded-3xl border border-border bg-card p-7 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl">{c.name}</h3>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                    {c.sub}
                  </div>
                </div>
                {"price" in c && c.price && (
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-display font-extrabold text-gradient-flame">
                      {c.price}
                    </div>
                    <div className="text-xs text-muted-foreground">{c.unit}</div>
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{c.desc}</p>
              {"tiers" in c && c.tiers && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {c.tiers.map((t) => (
                    <div
                      key={t.q}
                      className="rounded-xl border border-border bg-background/40 p-3 text-center"
                    >
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        {t.q}
                      </div>
                      <div className="text-lg font-display font-extrabold text-foreground mt-1">
                        {t.p}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-display font-extrabold text-lg text-foreground">{value}</span>
    </div>
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
      <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

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
              Text to grab one — $50
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
      tag: "Exact change preferred",
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
          no product references. Orders ship after payment is confirmed (COD excluded).
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
