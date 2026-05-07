import type { DoseLog, Medication, User } from "./types";

const KEYS = {
  users: "medremind:users",
  session: "medremind:session",
  meds: (uid: string) => `medremind:meds:${uid}`,
  logs: (uid: string) => `medremind:logs:${uid}`,
};

const isBrowser = () => typeof window !== "undefined";

export const hashPassword = (pw: string): string => {
  // Lightweight non-cryptographic hash; localStorage is not secure storage.
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (h << 5) - h + pw.charCodeAt(i);
    h |= 0;
  }
  return `h_${h}`;
};

export const getUsers = (): User[] => {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.users) || "[]");
  } catch {
    return [];
  }
};

export const saveUsers = (users: User[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.users, JSON.stringify(users));
};

export const getSessionUserId = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(KEYS.session);
};

export const setSessionUserId = (id: string | null) => {
  if (!isBrowser()) return;
  if (id) localStorage.setItem(KEYS.session, id);
  else localStorage.removeItem(KEYS.session);
};

export const getMedications = (uid: string): Medication[] => {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.meds(uid)) || "[]");
  } catch {
    return [];
  }
};

export const saveMedications = (uid: string, meds: Medication[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.meds(uid), JSON.stringify(meds));
};

export const getLogs = (uid: string): DoseLog[] => {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.logs(uid)) || "[]");
  } catch {
    return [];
  }
};

export const saveLogs = (uid: string, logs: DoseLog[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.logs(uid), JSON.stringify(logs));
};

export const uid = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
