"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Pill,
  CalendarRange,
  Stethoscope,
  StickyNote,
  Clock,
} from "lucide-react";
import Layout from "@/components/Layout";
import DoseTracker from "@/components/DoseTracker";
import AddMedicationModal from "@/components/AddMedicationModal";
import { useApp } from "@/context/AppContext";
import { formatTime } from "@/lib/schedule";

const FREQ: Record<string, string> = {
  daily: "Once daily",
  twice: "Twice daily",
  thrice: "3× daily",
  weekly: "Weekly",
  asneeded: "As needed",
};

export default function MedicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { medications, logs, deleteMedication } = useApp();
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const med = useMemo(
    () => medications.find((m) => m.id === params.id),
    [medications, params.id]
  );

  const medLogs = useMemo(
    () =>
      logs
        .filter((l) => l.medicationId === params.id)
        .sort(
          (a, b) =>
            parseISO(b.scheduledFor).getTime() -
            parseISO(a.scheduledFor).getTime()
        ),
    [logs, params.id]
  );

  if (!med) {
    return (
      <Layout>
        <div className="text-center">
          <p className="font-display text-xl font-semibold text-slate-900">
            Medication not found
          </p>
          <Link
            href="/medications"
            className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-500 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to medications
          </Link>
        </div>
      </Layout>
    );
  }

  const pct =
    med.totalDoses > 0
      ? Math.round((med.remainingDoses / med.totalDoses) * 100)
      : 0;

  return (
    <Layout>
      <Link
        href="/medications"
        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-4 rounded-3xl bg-white p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
            style={{ backgroundColor: `${med.color}1F`, color: med.color }}
          >
            <Pill className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              {med.name}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {med.dosage} {med.unit} • {FREQ[med.frequency]}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirmDel(true)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-500 transition hover:bg-rose-100"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Doses remaining</span>
            <span>
              {med.remainingDoses} of {med.totalDoses}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: med.color }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Meta
            icon={<CalendarRange className="h-4 w-4" />}
            label="Schedule"
            value={`${format(parseISO(med.startDate), "MMM d, yyyy")}${
              med.endDate
                ? " → " + format(parseISO(med.endDate), "MMM d, yyyy")
                : ""
            }`}
          />
          <Meta
            icon={<Clock className="h-4 w-4" />}
            label="Reminder times"
            value={
              med.reminderTimes.length === 0
                ? "As needed"
                : med.reminderTimes.map(formatTime).join(", ")
            }
          />
          {med.instructions && (
            <Meta
              icon={<StickyNote className="h-4 w-4" />}
              label="Instructions"
              value={med.instructions}
            />
          )}
          {med.prescriber && (
            <Meta
              icon={<Stethoscope className="h-4 w-4" />}
              label="Prescriber"
              value={med.prescriber}
            />
          )}
        </div>

        {med.notes && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            {med.notes}
          </div>
        )}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Today's doses
        </h2>
        <div className="mt-3">
          <DoseTracker
            date={new Date()}
            medicationId={med.id}
            emptyTitle="No doses today"
            emptyMessage="There are no scheduled doses for today."
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Dose history
        </h2>
        {medLogs.length === 0 ? (
          <p className="mt-3 rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-card">
            No history yet. Recorded doses will appear here.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {medLogs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-card"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {format(parseISO(l.scheduledFor), "EEE, MMM d • h:mm a")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {l.takenAt
                      ? `Taken at ${format(parseISO(l.takenAt), "h:mm a")}`
                      : "Status updated"}
                  </p>
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
            ))}
          </div>
        )}
      </section>

      <AddMedicationModal
        open={editing}
        onClose={() => setEditing(false)}
        editing={med}
      />

      {confirmDel && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDel(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-slate-900">
              Delete medication?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              This will remove {med.name} and its dose history. This cannot be
              undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDel(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMedication(med.id);
                  router.replace("/medications");
                }}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-slate-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm text-slate-900">{value}</p>
      </div>
    </div>
  );
}
