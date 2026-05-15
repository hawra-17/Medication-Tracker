"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  LogOut,
  Pencil,
  Pill,
  TrendingUp,
  Phone,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { computeAdherence, computeStreak } from "@/lib/schedule";
import { getHealthScore, emergencyContact } from "@/lib/pillData";
import EmergencyModal from "@/components/EmergencyModal";

export default function ProfilePage() {
  const { user, medications, logs, signOut, updateProfile, exportData } =
    useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const adherence = useMemo(() => computeAdherence(logs, 30), [logs]);
  const streak = useMemo(() => computeStreak(logs), [logs]);
  const taken = logs.filter((l) => l.status === "taken").length;
  const healthScore = useMemo(() => getHealthScore(medications, []), [medications]);

  if (!user) return null;

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed) updateProfile({ name: trimmed });
    setEditing(false);
  };

  const handleEmergencyCall = () => {
    window.location.href = `tel:${emergencyContact.phone}`;
    setEmergencyModalOpen(false);
  };

  return (
    <Layout>
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account</p>
      </header>

      {/* Card */}
      <section className="mt-6 rounded-3xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-300 via-sky-300 to-orange-300 font-display text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-cyan-300"
                />
                <button
                  onClick={saveName}
                  className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                  }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-xl font-bold tracking-tight text-slate-900">
                  {user.name}
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Edit name"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="mt-0.5 truncate text-sm text-slate-500">
              ✉️ {user.email}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" />
          Member since {format(parseISO(user.createdAt), "MMMM yyyy")}
        </div>
      </section>

      {/* Stats */}
      <h3 className="mt-8 font-display text-base font-bold text-slate-900">
        Your Stats
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          icon={<Pill className="h-4 w-4" />}
          label="Active medications"
          value={`${medications.length}`}
          tone="cyan"
        />
        <Stat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Doses taken"
          value={`${taken}`}
          tone="emerald"
        />
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          label="Health Score"
          value={`${healthScore.score}`}
          tone="purple"
        />
        <Stat
          icon={<CalendarDays className="h-4 w-4" />}
          label="Monthly adherence"
          value={`${adherence}%`}
          tone="amber"
        />
        <Stat
          icon={<CalendarDays className="h-4 w-4" />}
          label="Day streak"
          value={`${streak}`}
          tone="amber"
        />
      </div>

      {/* Emergency Contact */}
      <h3 className="mt-8 font-display text-base font-bold text-slate-900">
        Emergency Contact
      </h3>
      <div className="mt-3">
        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-left shadow-card transition hover:bg-red-100"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-500">
            <Phone className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">
              {emergencyContact.name}
            </p>
            <p className="text-xs text-red-600">
              {emergencyContact.phone}
            </p>
          </div>
        </button>
      </div>

      {/* Account */}
      <h3 className="mt-8 font-display text-base font-bold text-slate-900">
        Account
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={exportData}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition hover:bg-slate-50"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-500">
            <Download className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Export my data
            </p>
            <p className="text-xs text-slate-500">
              Download all medications and dose history as JSON
            </p>
          </div>
        </button>

        <button
          onClick={signOut}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition hover:bg-rose-50"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-500">
            <LogOut className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-rose-500">Sign Out</p>
        </button>
      </div>

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onConfirm={handleEmergencyCall}
      />
    </Layout>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "cyan" | "emerald" | "amber" | "purple";
}) {
  const tints: Record<string, string> = {
    cyan: "bg-cyan-50 text-cyan-500",
    emerald: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
    purple: "bg-purple-50 text-purple-500",
  };
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${tints[tone]}`}>
        {icon}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
