"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import MedicationCard from "@/components/MedicationCard";
import AddMedicationModal from "@/components/AddMedicationModal";
import { useApp } from "@/context/AppContext";
import { medicineSuggestions, getPillInteraction, getInstruction } from "@/lib/pillData";
import MedicineSelector from "@/components/MedicineSelector";

export default function MedicationsPage() {
  const { medications } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState("");

  // Filter out finished medications (remaining doses = 0)
  const activeMedications = medications.filter(m => m.remainingDoses > 0);

  return (
    <Layout>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            My Medications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeMedications.length}{" "}
            {activeMedications.length === 1 ? "medication" : "medications"} added
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

      {activeMedications.length === 0 ? (
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
          {activeMedications.map((m) => (
            <MedicationCard key={m.id} medication={m} />
          ))}
        </div>
      )}

      {/* Suggested Medicines */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-slate-900 mb-6">
          Suggested Medicines
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicineSuggestions.map((medicine) => (
            <div
              key={medicine}
              className="rounded-2xl bg-white p-4 shadow-card hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-slate-900 mb-2">{medicine}</h3>
              <p className="text-sm text-slate-600">{getPillInteraction(medicine)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Medicine Instructions */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-slate-900 mb-6">
          Medicine Instructions
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Choose Medicine
              </label>
              <MedicineSelector
                value={selectedMedicine}
                onChange={setSelectedMedicine}
                placeholder="Select a medicine"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSelectedMedicine("")}
                className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {selectedMedicine ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold text-lg text-slate-900 mb-3">
                {selectedMedicine}
              </h3>
              {(() => {
                const instruction = getInstruction(selectedMedicine);
                return (
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      <strong>Before / After food:</strong> {instruction.meal}
                    </p>
                    <p>
                      <strong>Side effects:</strong> {instruction.sideEffects}
                    </p>
                    <p>
                      <strong>Storage:</strong> {instruction.storage}
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a medicine to see its instructions.</p>
          )}
        </div>
      </section>

      <AddMedicationModal open={open} onClose={() => setOpen(false)} />
    </Layout>
  );
}
