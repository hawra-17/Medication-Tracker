"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import Layout from "@/components/Layout";
import DoseTracker from "@/components/DoseTracker";
import { useApp } from "@/context/AppContext";
import { buildScheduleForDay } from "@/lib/schedule";

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
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-300 via-sky-300 to-orange-300 font-display font-bold text-white">
          {user?.name.charAt(0).toUpperCase()}
        </div>
      </header>

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
