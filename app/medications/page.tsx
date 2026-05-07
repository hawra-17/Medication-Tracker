"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import MedicationCard from "@/components/MedicationCard";
import AddMedicationModal from "@/components/AddMedicationModal";
import { useApp } from "@/context/AppContext";

export default function MedicationsPage() {
  const { medications } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <Layout>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            My Medications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {medications.length}{" "}
            {medications.length === 1 ? "medication" : "medications"} added
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 text-white shadow-glow"
          aria-label="Add medication"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </header>

      {medications.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-3xl">
            💊
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            No medications yet
          </h2>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Add your medications to start tracking and get reminders
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-2.5 font-display text-sm font-semibold text-white shadow-glow"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} /> Add Medication
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {medications.map((m) => (
            <MedicationCard key={m.id} medication={m} />
          ))}
        </div>
      )}

      <AddMedicationModal open={open} onClose={() => setOpen(false)} />
    </Layout>
  );
}
