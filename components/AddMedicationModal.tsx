"use client";

import { useEffect, useState } from "react";
import { Pill, Plus, Trash2, X, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Frequency, Medication } from "@/lib/types";
import { medicineSuggestions, checkInteractions } from "@/lib/pillData";
import InteractionModal from "./InteractionModal";
import MedicineSelector from "./MedicineSelector";

const COLORS = [
  "#FACC15",
  "#FB923C",
  "#34D399",
  "#22D3EE",
  "#A78BFA",
  "#EC4899",
  "#EF4444",
  "#2DD4BF",
];

const UNITS = ["tablet", "capsule", "ml", "mg", "drop", "puff", "patch"];

const FREQS: { value: Frequency; label: string; defaultTimes: string[] }[] = [
  { value: "daily", label: "Daily", defaultTimes: ["08:00"] },
  { value: "twice", label: "Twice Daily", defaultTimes: ["08:00", "20:00"] },
  { value: "thrice", label: "3x Daily", defaultTimes: ["08:00", "14:00", "20:00"] },
  { value: "weekly", label: "Weekly", defaultTimes: ["08:00"] },
  { value: "asneeded", label: "As Needed", defaultTimes: [] },
];

const INSTRUCTIONS = [
  "Before meals",
  "After meals",
  "With food",
  "With water",
  "No Matter",
];

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Medication | null;
}

export default function AddMedicationModal({ open, onClose, editing }: Props) {
  const { addMedication, updateMedication, medications } = useApp();

  const [color, setColor] = useState(COLORS[3]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [unit, setUnit] = useState("tablet");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [totalDoses, setTotalDoses] = useState<number>(30);
  const [instructions, setInstructions] = useState<string>("No Matter");
  const [reminderTimes, setReminderTimes] = useState<string[]>(["08:00"]);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>("");
  const [prescriber, setPrescriber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [pendingMedication, setPendingMedication] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setColor(editing.color);
      setName(editing.name);
      setDosage(editing.dosage);
      setUnit(editing.unit);
      setFrequency(editing.frequency);
      setTotalDoses(editing.totalDoses);
      setInstructions(editing.instructions ?? "No Matter");
      setReminderTimes(
        editing.reminderTimes.length ? editing.reminderTimes : ["08:00"]
      );
      setStartDate(editing.startDate.slice(0, 10));
      setEndDate(editing.endDate ? editing.endDate.slice(0, 10) : "");
      setPrescriber(editing.prescriber ?? "");
      setNotes(editing.notes ?? "");
    } else {
      setColor(COLORS[3]);
      setName("");
      setDosage("");
      setUnit("tablet");
      setFrequency("daily");
      setTotalDoses(30);
      setInstructions("No Matter");
      setReminderTimes(["08:00"]);
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate("");
      setPrescriber("");
      setNotes("");
    }
    setError(null);
  }, [open, editing]);

  const handleFrequency = (f: Frequency) => {
    setFrequency(f);
    const def = FREQS.find((x) => x.value === f)?.defaultTimes ?? [];
    setReminderTimes(def);
  };

  const addTime = () => setReminderTimes((p) => [...p, "12:00"]);
  const removeTime = (idx: number) =>
    setReminderTimes((p) => p.filter((_, i) => i !== idx));
  const setTime = (idx: number, value: string) =>
    setReminderTimes((p) => p.map((t, i) => (i === idx ? value : t)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter a medication name.");
    if (!dosage.trim()) return setError("Please enter a dosage.");
    if (totalDoses <= 0) return setError("Total doses must be greater than zero.");

    // Check for interactions
    const activeMeds = medications.map(m => m.name);
    const interactionWarnings = checkInteractions(name.trim(), activeMeds);

    const payload = {
      name: name.trim(),
      dosage: dosage.trim(),
      unit,
      color,
      frequency,
      totalDoses,
      reminderTimes: frequency === "asneeded" ? [] : reminderTimes,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      instructions,
      prescriber: prescriber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (interactionWarnings.length > 0) {
      setPendingMedication(payload);
      setInteractionModalOpen(true);
    } else {
      if (editing) updateMedication(editing.id, payload);
      else addMedication(payload);
      onClose();
    }
  };

  const handleConfirmInteraction = () => {
    if (pendingMedication) {
      if (editing) updateMedication(editing.id, pendingMedication);
      else addMedication(pendingMedication);
      onClose();
    }
    setInteractionModalOpen(false);
    setPendingMedication(null);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-3xl bg-white shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Add Medication
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t border-slate-100" />

        <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {/* Color + pill icon */}
          <div className="mb-5 flex items-center gap-4">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: `${color}1F`, color }}
            >
              <Pill className="h-7 w-7" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-slate-500">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition ${
                      c === color
                        ? "ring-2 ring-offset-2 ring-cyan-400"
                        : "opacity-90 hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Field label="Medication Name">
            <MedicineSelector
              value={name}
              onChange={setName}
              placeholder="Choose or type medicine name"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dosage">
              <input
                type="text"
                inputMode="decimal"
                value={dosage}
                onChange={(e) => {
                  // Allow digits and a single decimal point only.
                  const cleaned = e.target.value
                    .replace(/[^\d.]/g, "")
                    .replace(/(\..*)\./g, "$1");
                  setDosage(cleaned);
                }}
                placeholder="e.g., 1"
                className={inputCls}
              />
            </Field>
            <Field label="Unit">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`${inputCls} pr-8`}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Frequency">
            <div className="flex flex-wrap gap-2">
              {FREQS.map((f) => (
                <button
                  type="button"
                  key={f.value}
                  onClick={() => handleFrequency(f.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    frequency === f.value
                      ? "bg-cyan-400 text-white shadow-glow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Total Doses (for tracking)">
            <input
              type="number"
              min={1}
              value={totalDoses === 0 ? "" : totalDoses}
              onChange={(e) => {
                const v = e.target.value;
                setTotalDoses(v === "" ? 0 : parseInt(v, 10));
              }}
              className={inputCls}
            />
          </Field>

          <Field label="Instructions">
            <div className="flex flex-wrap gap-2">
              {INSTRUCTIONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setInstructions(i)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    instructions === i
                      ? "bg-cyan-400 text-white shadow-glow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </Field>

          {frequency !== "asneeded" && (
            <Field
              label="Reminder Times"
              right={
                <button
                  type="button"
                  onClick={addTime}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-500 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Time
                </button>
              }
            >
              <div className="flex flex-col gap-2">
                {reminderTimes.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200"
                  >
                    <Clock className="h-4 w-4 text-slate-400" />
                    <input
                      type="time"
                      value={t}
                      onChange={(e) => setTime(i, e.target.value)}
                      className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
                    />
                    {reminderTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTime(i)}
                        className="rounded-md p-1 text-slate-400 hover:text-rose-500"
                        aria-label="Remove time"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {reminderTimes.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No times yet. Tap “Add Time”.
                  </p>
                )}
              </div>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="End Date (optional)">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Prescriber (optional)">
            <input
              value={prescriber}
              onChange={(e) => setPrescriber(e.target.value)}
              placeholder="Dr. Smith"
              className={inputCls}
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything important to remember about this medication"
              className={`${inputCls} resize-none`}
            />
          </Field>

          {error && (
            <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-orange-300 to-orange-400 py-3.5 font-display font-semibold text-white shadow-peach transition hover:brightness-105 active:scale-[0.99]"
          >
            {editing ? "Save Changes" : "Add Medication"}
          </button>
        </form>
      </div>

      <InteractionModal
        isOpen={interactionModalOpen}
        onClose={() => setInteractionModalOpen(false)}
        onConfirm={handleConfirmInteraction}
        warnings={checkInteractions(name.trim(), medications.map(m => m.name))}
        medicineName={name.trim()}
      />
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 outline-none transition focus:ring-cyan-300";

function Field({
  label,
  children,
  right,
}: {
  label: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900">{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}
