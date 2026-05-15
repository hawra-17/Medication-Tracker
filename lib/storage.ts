import { supabase } from "./supabase";
import type { DoseLog, Medication, User } from "./types";

// ---- Row <-> domain mapping ---------------------------------

type MedRow = {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  unit: string;
  color: string;
  frequency: Medication["frequency"];
  total_doses: number;
  remaining_doses: number;
  reminder_times: string[];
  start_date: string;
  end_date: string | null;
  instructions: string | null;
  notes: string | null;
  prescriber: string | null;
  created_at: string;
};

const rowToMed = (r: MedRow): Medication => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  dosage: r.dosage,
  unit: r.unit,
  color: r.color,
  frequency: r.frequency,
  totalDoses: r.total_doses,
  remainingDoses: r.remaining_doses,
  reminderTimes: r.reminder_times ?? [],
  startDate: r.start_date,
  endDate: r.end_date ?? undefined,
  instructions: r.instructions ?? undefined,
  notes: r.notes ?? undefined,
  prescriber: r.prescriber ?? undefined,
  createdAt: r.created_at,
});

const medToRow = (m: Medication): MedRow => ({
  id: m.id,
  user_id: m.userId,
  name: m.name,
  dosage: m.dosage,
  unit: m.unit,
  color: m.color,
  frequency: m.frequency,
  total_doses: m.totalDoses,
  remaining_doses: m.remainingDoses,
  reminder_times: m.reminderTimes,
  start_date: m.startDate,
  end_date: m.endDate ?? null,
  instructions: m.instructions ?? null,
  notes: m.notes ?? null,
  prescriber: m.prescriber ?? null,
  created_at: m.createdAt,
});

type LogRow = {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_for: string;
  status: DoseLog["status"];
  taken_at: string | null;
  note: string | null;
};

const rowToLog = (r: LogRow): DoseLog => ({
  id: r.id,
  userId: r.user_id,
  medicationId: r.medication_id,
  scheduledFor: r.scheduled_for,
  status: r.status,
  takenAt: r.taken_at ?? undefined,
  note: r.note ?? undefined,
});

const logToRow = (l: DoseLog): LogRow => ({
  id: l.id,
  user_id: l.userId,
  medication_id: l.medicationId,
  scheduled_for: l.scheduledFor,
  status: l.status,
  taken_at: l.takenAt ?? null,
  note: l.note ?? null,
});

// ---- Profile -------------------------------------------------

export const getProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    createdAt: data.created_at,
  };
};

export const saveProfile = async (
  userId: string,
  patch: Partial<Pick<User, "name" | "email">>
): Promise<void> => {
  await supabase.from("profiles").update(patch).eq("id", userId);
};

// ---- Medications --------------------------------------------

export const getMedications = async (uid: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as MedRow[]).map(rowToMed);
};

export const insertMedication = async (m: Medication): Promise<void> => {
  const { error } = await supabase.from("medications").insert(medToRow(m));
  if (error) throw error;
};

export const updateMedicationRow = async (
  id: string,
  patch: Partial<Medication>
): Promise<void> => {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.dosage !== undefined) row.dosage = patch.dosage;
  if (patch.unit !== undefined) row.unit = patch.unit;
  if (patch.color !== undefined) row.color = patch.color;
  if (patch.frequency !== undefined) row.frequency = patch.frequency;
  if (patch.totalDoses !== undefined) row.total_doses = patch.totalDoses;
  if (patch.remainingDoses !== undefined)
    row.remaining_doses = patch.remainingDoses;
  if (patch.reminderTimes !== undefined)
    row.reminder_times = patch.reminderTimes;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.endDate !== undefined) row.end_date = patch.endDate ?? null;
  if (patch.instructions !== undefined)
    row.instructions = patch.instructions ?? null;
  if (patch.notes !== undefined) row.notes = patch.notes ?? null;
  if (patch.prescriber !== undefined) row.prescriber = patch.prescriber ?? null;
  if (Object.keys(row).length === 0) return;
  await supabase.from("medications").update(row).eq("id", id);
};

export const deleteMedicationRow = async (id: string): Promise<void> => {
  await supabase.from("medications").delete().eq("id", id);
};

// ---- Dose logs ----------------------------------------------

export const getLogs = async (uid: string): Promise<DoseLog[]> => {
  const { data, error } = await supabase
    .from("dose_logs")
    .select("*")
    .eq("user_id", uid);
  if (error || !data) return [];
  return (data as LogRow[]).map(rowToLog);
};

export const upsertLog = async (log: DoseLog): Promise<void> => {
  await supabase.from("dose_logs").upsert(logToRow(log));
};

export const deleteLogsForMedication = async (
  medicationId: string
): Promise<void> => {
  await supabase
    .from("dose_logs")
    .delete()
    .eq("medication_id", medicationId);
};

// ---- Misc ----------------------------------------------------

// Produce a valid UUID v4. crypto.randomUUID() only exists in secure
// contexts (https/localhost), so fall back to getRandomValues, which
// works over plain http/LAN too.
export const uid = (): string => {
  const c: Crypto | undefined =
    typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
};
