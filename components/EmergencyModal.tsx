"use client";

import { useState } from "react";
import { Phone, X, AlertTriangle } from "lucide-react";
import { emergencyContact } from "@/lib/pillData";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EmergencyModal({
  isOpen,
  onClose,
  onConfirm,
}: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-scale-in rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Emergency Contact
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
            Are you sure you want to call <strong>{emergencyContact.name}</strong>?
          </p>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <Phone className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {emergencyContact.phone}
            </span>
          </div>
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
            className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600"
          >
            Call Now
          </button>
        </div>
      </div>
    </div>
  );
}