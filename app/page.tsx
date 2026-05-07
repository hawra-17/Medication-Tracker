"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User as UserIcon, Pill } from "lucide-react";
import { useApp } from "@/context/AppContext";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const { user, ready, signIn, signUp } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (tab === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setBusy(true);
    const res =
      tab === "signin"
        ? signIn(email, password)
        : signUp(name, email, password);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo + brand */}
        <div className="flex flex-col items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300 via-sky-300 to-orange-300 shadow-soft">
            <Pill className="h-9 w-9 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900">
            MedRemind
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Never miss a dose again
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-card">
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            {tab === "signup" && (
              <Field label="Full Name" icon={<UserIcon className="h-4 w-4" />}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={inputCls}
                />
              </Field>
            )}

            <Field label="Email" icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
              />
            </Field>

            <Field label="Password" icon={<Lock className="h-4 w-4" />}>
              <input
                type="password"
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </Field>

            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-2xl bg-orange-500 py-3.5 font-display text-sm font-semibold text-white shadow-peach transition hover:brightness-105 disabled:opacity-60"
            >
              {tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your health companion for medication adherence
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-transparent pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none";

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <p className="mb-1.5 text-sm font-semibold text-slate-900">{label}</p>
      <div className="relative flex items-center rounded-2xl bg-slate-50 ring-1 ring-slate-200 transition focus-within:ring-cyan-300">
        <span className="absolute left-3.5 text-slate-400">{icon}</span>
        {children}
      </div>
    </label>
  );
}
