"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  getLogs,
  getMedications,
  getSessionUserId,
  getUsers,
  hashPassword,
  saveLogs,
  saveMedications,
  saveUsers,
  setSessionUserId,
  uid,
} from "@/lib/storage";
import type { DoseLog, DoseStatus, Medication, User } from "@/lib/types";
import { buildScheduleForDay } from "@/lib/schedule";
import {
  requestNotificationPermission,
  sendNotification,
} from "@/lib/notifications";

interface AppContextValue {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (
    name: string,
    email: string,
    password: string
  ) => { ok: boolean; error?: string };
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "email">>) => void;
  medications: Medication[];
  logs: DoseLog[];
  addMedication: (
    m: Omit<Medication, "id" | "userId" | "createdAt" | "remainingDoses"> &
      Partial<Pick<Medication, "remainingDoses">>
  ) => Medication;
  updateMedication: (id: string, patch: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  recordDose: (
    medicationId: string,
    scheduledFor: string,
    status: DoseStatus,
    note?: string
  ) => void;
  exportData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const router = useRouter();
  const lastFiredRef = useRef<Set<string>>(new Set());

  // Hydrate from localStorage on mount
  useEffect(() => {
    const sid = getSessionUserId();
    if (sid) {
      const u = getUsers().find((x) => x.id === sid);
      if (u) {
        setUser(u);
        setMedications(getMedications(u.id));
        setLogs(getLogs(u.id));
      }
    }
    setReady(true);
  }, []);

  // Persist on changes
  useEffect(() => {
    if (user) saveMedications(user.id, medications);
  }, [user, medications]);

  useEffect(() => {
    if (user) saveLogs(user.id, logs);
  }, [user, logs]);

  // Ask for notification permission once signed in
  useEffect(() => {
    if (user) requestNotificationPermission();
  }, [user]);

  // Reminder loop: every 60s
  useEffect(() => {
    if (!user) return;
    const tick = () => {
      const now = new Date();
      const slots = buildScheduleForDay(medications, logs, now);
      for (const s of slots) {
        const due = new Date(s.scheduledFor);
        const diff = (now.getTime() - due.getTime()) / 1000;
        // fire if within 60s window after scheduled time and not yet recorded/fired
        if (
          s.status === "pending" &&
          diff >= 0 &&
          diff <= 90 &&
          !lastFiredRef.current.has(s.scheduledFor + s.medication.id)
        ) {
          lastFiredRef.current.add(s.scheduledFor + s.medication.id);
          sendNotification(
            `Time to take ${s.medication.name}`,
            `${s.medication.dosage} ${s.medication.unit} • Scheduled at ${s.time}`
          );
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [user, medications, logs]);

  const signIn = useCallback<AppContextValue["signIn"]>((email, password) => {
    const users = getUsers();
    const u = users.find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!u) return { ok: false, error: "No account with that email." };
    if (u.passwordHash !== hashPassword(password))
      return { ok: false, error: "Incorrect password." };
    setSessionUserId(u.id);
    setUser(u);
    setMedications(getMedications(u.id));
    setLogs(getLogs(u.id));
    router.push("/dashboard");
    return { ok: true };
  }, [router]);

  const signUp = useCallback<AppContextValue["signUp"]>(
    (name, email, password) => {
      const users = getUsers();
      if (
        users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())
      ) {
        return { ok: false, error: "An account with that email already exists." };
      }
      const u: User = {
        id: uid(),
        name: name.trim(),
        email: email.trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, u]);
      setSessionUserId(u.id);
      setUser(u);
      setMedications([]);
      setLogs([]);
      router.push("/dashboard");
      return { ok: true };
    },
    [router]
  );

  const signOut = useCallback(() => {
    setSessionUserId(null);
    setUser(null);
    setMedications([]);
    setLogs([]);
    router.push("/");
  }, [router]);

  const updateProfile = useCallback<AppContextValue["updateProfile"]>(
    (patch) => {
      if (!user) return;
      const users = getUsers();
      const next = users.map((u) =>
        u.id === user.id ? { ...u, ...patch } : u
      );
      saveUsers(next);
      const me = next.find((u) => u.id === user.id) ?? user;
      setUser(me);
    },
    [user]
  );

  const addMedication = useCallback<AppContextValue["addMedication"]>(
    (m) => {
      if (!user) throw new Error("Not signed in");
      const med: Medication = {
        ...m,
        id: uid(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        remainingDoses: m.remainingDoses ?? m.totalDoses,
      };
      setMedications((prev) => [med, ...prev]);
      return med;
    },
    [user]
  );

  const updateMedication = useCallback<AppContextValue["updateMedication"]>(
    (id, patch) => {
      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
    },
    []
  );

  const deleteMedication = useCallback<AppContextValue["deleteMedication"]>(
    (id) => {
      setMedications((prev) => prev.filter((m) => m.id !== id));
      setLogs((prev) => prev.filter((l) => l.medicationId !== id));
    },
    []
  );

  const recordDose = useCallback<AppContextValue["recordDose"]>(
    (medicationId, scheduledFor, status, note) => {
      if (!user) return;
      setLogs((prev) => {
        const idx = prev.findIndex(
          (l) =>
            l.medicationId === medicationId && l.scheduledFor === scheduledFor
        );
        const log: DoseLog = {
          id: idx >= 0 ? prev[idx].id : uid(),
          userId: user.id,
          medicationId,
          scheduledFor,
          status,
          takenAt: status === "taken" ? new Date().toISOString() : undefined,
          note,
        };
        const next = idx >= 0 ? [...prev] : [...prev, log];
        if (idx >= 0) next[idx] = log;
        return next;
      });
      // adjust remaining doses
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id !== medicationId) return m;
          // recompute by counting taken logs after this update is tricky; use simple decrement on first taken
          const already = logs.find(
            (l) =>
              l.medicationId === medicationId &&
              l.scheduledFor === scheduledFor
          );
          let remaining = m.remainingDoses;
          if (status === "taken" && (!already || already.status !== "taken")) {
            remaining = Math.max(0, remaining - 1);
          } else if (
            status !== "taken" &&
            already &&
            already.status === "taken"
          ) {
            remaining = Math.min(m.totalDoses, remaining + 1);
          }
          return { ...m, remainingDoses: remaining };
        })
      );
    },
    [user, logs]
  );

  const exportData = useCallback(() => {
    if (!user) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      user: { id: user.id, name: user.name, email: user.email },
      medications,
      logs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medremind-${user.name.replace(/\s+/g, "-").toLowerCase()}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [user, medications, logs]);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      ready,
      signIn,
      signUp,
      signOut,
      updateProfile,
      medications,
      logs,
      addMedication,
      updateMedication,
      deleteMedication,
      recordDose,
      exportData,
    }),
    [
      user,
      ready,
      signIn,
      signUp,
      signOut,
      updateProfile,
      medications,
      logs,
      addMedication,
      updateMedication,
      deleteMedication,
      recordDose,
      exportData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
