"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { TrendingUp, Target, CalendarDays, BellRing } from "lucide-react";
import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import {
  computeAdherence,
  computeStreak,
} from "@/lib/schedule";
import { requestNotificationPermission } from "@/lib/notifications";

export default function HistoryPage() {
  const { medications, logs } = useApp();
  const [perm, setPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, []);

  const adherence7 = useMemo(() => computeAdherence(logs, 7), [logs]);
  const adherence30 = useMemo(() => computeAdherence(logs, 30), [logs]);
  const streak = useMemo(() => computeStreak(logs), [logs]);

  const week = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 5 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  const recent = useMemo(
    () =>
      [...logs]
        .sort(
          (a, b) =>
            parseISO(b.scheduledFor).getTime() -
            parseISO(a.scheduledFor).getTime()
        )
        .slice(0, 12),
    [logs]
  );

  const enable = async () => {
    const r = await requestNotificationPermission();
    setPerm(r);
  };

  return (
    <Layout>
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your medication adherence
        </p>
      </header>

      {perm !== "granted" && (
        <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-500">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">
                Enable browser reminders
              </p>
              <p className="text-xs text-slate-500">
                We'll check every 60 seconds and notify you when a dose is due.
              </p>
            </div>
          </div>
          <button
            onClick={enable}
            className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-white shadow-glow"
          >
            Enable
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          tone="cyan"
          label="7-day rate"
          value={`${adherence7}%`}
        />
        <Stat
          icon={<Target className="h-4 w-4" />}
          tone="emerald"
          label="30-day rate"
          value={`${adherence30}%`}
        />
        <Stat
          icon={<CalendarDays className="h-4 w-4" />}
          tone="amber"
          label="day streak"
          value={`${streak}`}
        />
      </div>

      {/* This week */}
      <section className="mt-8 rounded-3xl bg-white p-5 shadow-card">
        <h2 className="font-display text-base font-bold text-slate-900">
          This Week
        </h2>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {week.map((d) => {
            const dayLogs = logs.filter(
              (l) =>
                format(parseISO(l.scheduledFor), "yyyy-MM-dd") ===
                format(d, "yyyy-MM-dd")
            );
            const taken = dayLogs.filter((l) => l.status === "taken").length;
            const total = dayLogs.length;
            const ratio = total ? taken / total : 0;
            const isToday =
              format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <div key={d.toISOString()} className="flex flex-col items-center">
                <div className="relative h-20 w-full overflow-hidden rounded-2xl bg-slate-50">
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-400 to-teal-300 transition-all"
                    style={{ height: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
                <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {format(d, "EEE")}
                </span>
                <span
                  className={`font-display text-sm font-bold ${
                    isToday ? "text-cyan-500" : "text-slate-900"
                  }`}
                >
                  {format(d, "d")}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Recent Activity
        </h2>
        {recent.length === 0 ? (
          <p className="mt-3 py-10 text-center text-sm text-slate-500">
            No activity yet
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {recent.map((l) => {
              const med = medications.find((m) => m.id === l.medicationId);
              if (!med) return null;
              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-card"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base"
                      style={{
                        backgroundColor: `${med.color}1F`,
                        color: med.color,
                      }}
                    >
                      💊
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {med.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(l.scheduledFor), "MMM d • h:mm a")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      l.status === "taken"
                        ? "bg-emerald-50 text-emerald-600"
                        : l.status === "skipped"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
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
  tone: "cyan" | "emerald" | "amber";
}) {
  const tints: Record<string, string> = {
    cyan: "bg-cyan-50 text-cyan-500",
    emerald: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
  };
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div
        className={`grid h-9 w-9 place-items-center rounded-xl ${tints[tone]}`}
      >
        {icon}
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
