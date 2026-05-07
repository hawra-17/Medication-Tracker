"use client";

import { useMemo } from "react";
import { Check, X, AlarmClock, Pill } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { buildScheduleForDay, formatTime } from "@/lib/schedule";

interface Props {
  date?: Date;
  medicationId?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function DoseTracker({
  date = new Date(),
  medicationId,
  emptyTitle = "No medications scheduled",
  emptyMessage = "Add your first medication using the + button below",
}: Props) {
  const { medications, logs, recordDose } = useApp();

  const slots = useMemo(() => {
    const all = buildScheduleForDay(medications, logs, date);
    return medicationId ? all.filter((s) => s.medication.id === medicationId) : all;
  }, [medications, logs, date, medicationId]);

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-3xl">
          💊
        </div>
        <p className="font-display text-lg font-semibold text-slate-900">
          {emptyTitle}
        </p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {slots.map((s) => {
        const isPast = new Date(s.scheduledFor).getTime() < Date.now();
        return (
          <div
            key={s.scheduledFor + s.medication.id}
            className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-card transition"
          >
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
              style={{
                backgroundColor: `${s.medication.color}1F`,
                color: s.medication.color,
              }}
            >
              <Pill className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold text-slate-900">
                {s.medication.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {s.medication.dosage} {s.medication.unit} •{" "}
                <span className="inline-flex items-center gap-1">
                  <AlarmClock className="h-3 w-3" />
                  {formatTime(s.time)}
                </span>
              </p>
            </div>
            <StatusBadge status={s.status} pastDue={isPast} />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  recordDose(s.medication.id, s.scheduledFor, "taken")
                }
                title="Mark as taken"
                className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                  s.status === "taken"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  recordDose(s.medication.id, s.scheduledFor, "skipped")
                }
                title="Skip dose"
                className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                  s.status === "skipped"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({
  status,
  pastDue,
}: {
  status: "pending" | "taken" | "skipped" | "missed";
  pastDue: boolean;
}) {
  if (status === "taken")
    return (
      <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
        Taken
      </span>
    );
  if (status === "skipped")
    return (
      <span className="hidden sm:inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
        Skipped
      </span>
    );
  if (pastDue)
    return (
      <span className="hidden sm:inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
        Overdue
      </span>
    );
  return (
    <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      Upcoming
    </span>
  );
}
