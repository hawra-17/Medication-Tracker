"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warnings: string[];
  medicineName: string;
}

export default function InteractionModal({
  isOpen,
  onClose,
  onConfirm,
  warnings,
  medicineName,
}: InteractionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-scale-in rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Drug Interaction Warning
            </h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-3">
            Adding <strong>{medicineName}</strong> may interact with your current medications:
          </p>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 mt-1">⚠️</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}