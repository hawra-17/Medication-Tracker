export type Frequency = "daily" | "twice" | "thrice" | "weekly" | "asneeded";

export type DoseStatus = "taken" | "skipped" | "missed" | "pending";

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  unit: string;
  color: string;
  frequency: Frequency;
  totalDoses: number;
  remainingDoses: number;
  reminderTimes: string[]; // ["08:00", "20:00"]
  startDate: string; // ISO date
  endDate?: string; // ISO date
  instructions?: string;
  notes?: string;
  prescriber?: string;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  userId: string;
  medicationId: string;
  scheduledFor: string; // ISO datetime
  status: DoseStatus;
  takenAt?: string;
  note?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
