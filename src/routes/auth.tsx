import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/juanna-world-logo.png.asset.json";

const SUPPORT_SMS = `sms:+13156771426?&body=${encodeURIComponent(
  "Juanna World — password reset request. My username: ",
)}`;

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · Juanna World" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const u = username.trim().toLowerCase();
        if (u.length < 3 || !/^[a-z0-9_.-]+$/.test(u)) {
          setErr("Username: 3+ chars, letters/numbers/.-_ only.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pw,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username: u, phone: phone.trim() },
          },
        });
        if (error) {
          setErr(error.message);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pw,
        });
        if (error) {
          setErr(error.message);
          return;
        }
      }
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero text-foreground flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <Link to="/">
              <img
                src={logo.url}
                alt="Juanna World"
                className="w-24 h-24 mx-auto drop-shadow-2xl"
              />
            </Link>
            <h1 className="mt-5 text-3xl md:text-4xl font-extrabold">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Real account · order history, rewards, and dashboard.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card space-y-4"
          >
            {mode === "signup" && (
              <>
                <Field
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  placeholder="yourname"
                />
                <Field
                  label="Phone (for rewards)"
                  value={phone}
                  onChange={setPhone}
                  placeholder="(315) 555-0123"
                  type="tel"
                />
              </>
            )}
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              type="email"
            />
            <Field
              label="Password"
              value={pw}
              onChange={setPw}
              placeholder="••••••••"
              type="password"
            />
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
              Text our support line and we'll reset it for you.
            </p>
            <a
              href={SUPPORT_SMS}
              className="mt-3 inline-block rounded-full bg-secondary text-secondary-foreground font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition"
            >
              Text Support · (315) 677-1426
            </a>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        placeholder={placeholder}
        type={type}
        className="mt-2 w-full rounded-xl bg-background border border-border px-4 py-3 outline-none focus:border-primary transition"
      />
    </div>
  );
}
