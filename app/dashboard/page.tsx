"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import Layout from "@/components/Layout";
import DoseTracker from "@/components/DoseTracker";
import { useApp } from "@/context/AppContext";
import {
  buildScheduleForDay,
  computeAdherence,
  computeHealthScore,
} from "@/lib/schedule";
import { getHealthTip } from "@/lib/pillData";

export default function DashboardPage() {
  const { user, medications, logs } = useApp();
  const [selected, setSelected] = useState<Date>(new Date());

  const week = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  const todays = useMemo(
    () => buildScheduleForDay(medications, logs, selected),
    [medications, logs, selected]
  );
  const takenToday = todays.filter((s) => s.status === "taken").length;
  const isAllDone = todays.length > 0 && takenToday === todays.length;

  const subtitle =
    todays.length === 0
      ? "All done for today!"
      : isAllDone
      ? "All done for today!"
      : `${takenToday}/${todays.length} doses taken so far`;

  // Enhanced health metrics
  const activeMedications = medications.filter(m => m.remainingDoses > 0);
  const healthScore = useMemo(
    () => computeHealthScore(medications, logs),
    [medications, logs]
  );
  const adherenceRate = useMemo(
    () => computeAdherence(logs, 30),
    [logs]
  );
  const dailyTip = useMemo(
    () => getHealthTip(activeMedications.map((m) => m.name) as never),
    [activeMedications]
  );

  return (
    <Layout>
      {/* Greeting + avatar */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Hello, {user?.name.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-base text-slate-500">{subtitle}</p>
        </div>
        <Link
          href="/profile"
          aria-label="Open profile"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-300 via-sky-300 to-orange-300 font-display font-bold text-white transition hover:brightness-105 active:scale-95"
        >
          {user?.name.charAt(0).toUpperCase()}
        </Link>
      </header>

      {/* Health Metrics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Health Score</p>
              <p className="text-2xl font-bold">{healthScore.score}</p>
              <p className="text-xs opacity-75">{healthScore.level}</p>
            </div>
            <div className="text-3xl">🏥</div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Adherence Rate</p>
              <p className="text-2xl font-bold">{adherenceRate}%</p>
              <p className="text-xs opacity-75">Medication compliance</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Active Medicines</p>
              <p className="text-2xl font-bold">{activeMedications.length}</p>
              <p className="text-xs opacity-75">Currently tracking</p>
            </div>
            <div className="text-3xl">💊</div>
          </div>
        </div>
      </div>

      {/* Daily Health Tip */}
      <div className="mt-6 rounded-2xl bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold text-slate-900">Daily Health Tip</h3>
            <p className="mt-1 text-sm text-slate-600">{dailyTip}</p>
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div className="mt-8 grid grid-cols-7 gap-1.5 sm:gap-3">
        {week.map((d) => {
          const isSel = isSameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelected(d)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 transition ${
                isSel
                  ? "bg-cyan-400 text-white shadow-glow"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {format(d, "EEE")}
              </span>
              <span className="font-display text-xl font-bold">
                {format(d, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Today section */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {isSameDay(selected, new Date())
            ? "Today"
            : format(selected, "EEEE, MMM d")}
        </h2>
        <div className="mt-4">
          <DoseTracker date={selected} />
        </div>
      </section>
    </Layout>
  );
}
