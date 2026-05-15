"use client";

import Link from "next/link";
import { Pill, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import type { Medication } from "@/lib/types";
import { formatTime } from "@/lib/schedule";
import { getPillInteraction } from "@/lib/pillData";

const FREQ_LABEL: Record<Medication["frequency"], string> = {
  daily: "Once daily",
  twice: "Twice daily",
  thrice: "3× daily",
  weekly: "Weekly",
  asneeded: "As needed",
};

export default function MedicationCard({
  medication,
}: {
  medication: Medication;
}) {
  const pct =
    medication.totalDoses > 0
      ? Math.round((medication.remainingDoses / medication.totalDoses) * 100)
      : 0;
  const low = medication.remainingDoses <= Math.max(3, medication.totalDoses * 0.1);

  return (
    <Link
      href={`/medications/${medication.id}`}
      className="group block overflow-hidden rounded-3xl bg-white p-5 shadow-card transition hover:shadow-soft"
    >
      <div className="flex items-start gap-4">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{ backgroundColor: `${medication.color}1F`, color: medication.color }}
        >
          <Pill className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-slate-900">
                {medication.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {medication.dosage} {medication.unit} •{" "}
                {FREQ_LABEL[medication.frequency]}
              </p>
            </div>
            {low && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                <AlertCircle className="h-3 w-3" />
                Low
              </span>
            )}
          </div>

          {medication.reminderTimes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {medication.reminderTimes.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                >
                  <Clock className="h-3 w-3" />
                  {formatTime(t)}
                </span>
              ))}
            </div>
          )}

          {/* Interaction Info */}
          <div className="mt-3 rounded-lg bg-slate-50 p-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                {getPillInteraction(medication.name)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Remaining</span>
              <span>
                {medication.remainingDoses}/{medication.totalDoses}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: medication.color }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
