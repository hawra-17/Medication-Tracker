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

// Real health score derived from actual dose history, so it changes
// as the user takes / skips doses.
export const computeHealthScore = (
  meds: Medication[],
  logs: DoseLog[]
): { score: number; level: string } => {
  const activeMeds = meds.filter((m) => m.remainingDoses > 0);
  const adherence = computeAdherence(logs, 30); // 0–100
  const recent = logs.filter(
    (l) => parseISO(l.scheduledFor) >= subDays(new Date(), 30)
  );
  const hasHistory = recent.length > 0;

  // No doses recorded yet → neutral starting score, not a misleading 0.
  if (!hasHistory) {
    return {
      score: activeMeds.length > 0 ? 50 : 0,
      level: activeMeds.length > 0 ? "Good" : "Needs Improvement",
    };
  }

  const streak = Math.min(computeStreak(logs), 10);
  const score = Math.round(
    adherence * 0.7 +
      (Math.min(activeMeds.length, 3) / 3) * 10 +
      (streak / 10) * 20
  );
  const level =
    score >= 75 ? "Excellent" : score >= 50 ? "Good" : "Needs Improvement";
  return { score, level };
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
