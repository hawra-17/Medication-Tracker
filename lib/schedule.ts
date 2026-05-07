import { format, isSameDay, parseISO, startOfDay, subDays } from "date-fns";
import type { DoseLog, Medication } from "./types";

export interface ScheduleSlot {
  medication: Medication;
  time: string; // "08:00"
  scheduledFor: string; // ISO datetime today
  status: "pending" | "taken" | "skipped" | "missed";
  logId?: string;
}

const buildIso = (day: Date, hhmm: string): string => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const d = new Date(day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
};

export const buildScheduleForDay = (
  meds: Medication[],
  logs: DoseLog[],
  day: Date
): ScheduleSlot[] => {
  const slots: ScheduleSlot[] = [];
  for (const med of meds) {
    if (med.frequency === "asneeded") continue;
    const start = parseISO(med.startDate);
    if (startOfDay(day).getTime() < startOfDay(start).getTime()) continue;
    if (med.endDate) {
      const end = parseISO(med.endDate);
      if (startOfDay(day).getTime() > startOfDay(end).getTime()) continue;
    }
    if (med.frequency === "weekly") {
      if (start.getDay() !== day.getDay()) continue;
    }
    for (const t of med.reminderTimes) {
      const iso = buildIso(day, t);
      const log = logs.find(
        (l) => l.medicationId === med.id && l.scheduledFor === iso
      );
      slots.push({
        medication: med,
        time: t,
        scheduledFor: iso,
        status: log?.status ?? "pending",
        logId: log?.id,
      });
    }
  }
  return slots.sort((a, b) => a.time.localeCompare(b.time));
};

export const formatTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return format(d, "h:mm a");
};

export const computeAdherence = (
  logs: DoseLog[],
  days: number
): number => {
  const since = subDays(new Date(), days);
  const recent = logs.filter((l) => parseISO(l.scheduledFor) >= since);
  if (recent.length === 0) return 100;
  const taken = recent.filter((l) => l.status === "taken").length;
  return Math.round((taken / recent.length) * 100);
};

export const computeStreak = (logs: DoseLog[]): number => {
  if (logs.length === 0) return 0;
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const day = subDays(cursor, i);
    const dayLogs = logs.filter((l) => isSameDay(parseISO(l.scheduledFor), day));
    if (dayLogs.length === 0) {
      if (i === 0) continue;
      break;
    }
    const allTaken = dayLogs.every((l) => l.status === "taken");
    if (allTaken) streak++;
    else break;
  }
  return streak;
};
