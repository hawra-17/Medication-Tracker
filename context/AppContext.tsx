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
import { supabase } from "@/lib/supabase";
import {
  deleteLogsForMedication,
  deleteMedicationRow,
  getLogs,
  getMedications,
  getProfile,
  insertMedication,
  saveProfile,
  updateMedicationRow,
  upsertLog,
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
  signIn: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
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
  const loadedUserIdRef = useRef<string | null>(null);

  // Load profile + data for a signed-in auth user
  const loadForUser = useCallback(
    async (authUserId: string, fallbackEmail: string) => {
      let profile = await getProfile(authUserId);
      if (!profile) {
        // Profile row may not exist yet right after sign-up; use a minimal one.
        profile = {
          id: authUserId,
          name: "",
          email: fallbackEmail,
          createdAt: new Date().toISOString(),
        };
      }
      const [meds, ls] = await Promise.all([
        getMedications(authUserId),
        getLogs(authUserId),
      ]);
      loadedUserIdRef.current = authUserId;
      setUser(profile);
      setMedications(meds);
      setLogs(ls);
    },
    []
  );

  // Restore session on mount + listen for auth changes
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session?.user && active) {
        await loadForUser(session.user.id, session.user.email ?? "");
      }
      if (active) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Only (re)load when the signed-in user actually changes.
          // Ignoring repeat events (token refresh, tab focus) prevents
          // a refetch from clobbering optimistic local state.
          if (loadedUserIdRef.current !== session.user.id) {
            await loadForUser(session.user.id, session.user.email ?? "");
          }
        } else {
          loadedUserIdRef.current = null;
          setUser(null);
          setMedications([]);
          setLogs([]);
        }
      }
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadForUser]);

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

  const signIn = useCallback<AppContextValue["signIn"]>(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        await loadForUser(data.user.id, data.user.email ?? "");
      }
      router.push("/dashboard");
      return { ok: true };
    },
    [router, loadForUser]
  );

  const signUp = useCallback<AppContextValue["signUp"]>(
    async (name, email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (error) return { ok: false, error: error.message };
      if (!data.session) {
        // Email confirmation is enabled in the Supabase project.
        return {
          ok: false,
          error: "Check your email to confirm your account, then sign in.",
        };
      }
      if (data.user) {
        // Profile is created by the DB trigger; seed local state immediately.
        loadedUserIdRef.current = data.user.id;
        setUser({
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
        });
        setMedications([]);
        setLogs([]);
      }
      router.push("/dashboard");
      return { ok: true };
    },
    [router]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMedications([]);
    setLogs([]);
    router.push("/");
  }, [router]);

  const updateProfile = useCallback<AppContextValue["updateProfile"]>(
    (patch) => {
      if (!user) return;
      setUser({ ...user, ...patch });
      void saveProfile(user.id, patch);
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
      void insertMedication(med).catch((e) => {
        console.error("Supabase insertMedication failed:", e);
        const msg =
          e?.message || e?.error_description || JSON.stringify(e);
        if (typeof window !== "undefined") {
          window.alert(`Could not save medication:\n\n${msg}`);
        }
        // Roll back optimistic add on failure.
        setMedications((prev) => prev.filter((x) => x.id !== med.id));
      });
      return med;
    },
    [user]
  );

  const updateMedication = useCallback<AppContextValue["updateMedication"]>(
    (id, patch) => {
      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
      void updateMedicationRow(id, patch);
    },
    []
  );

  const deleteMedication = useCallback<AppContextValue["deleteMedication"]>(
    (id) => {
      setMedications((prev) => prev.filter((m) => m.id !== id));
      setLogs((prev) => prev.filter((l) => l.medicationId !== id));
      void deleteMedicationRow(id);
    },
    []
  );

  const recordDose = useCallback<AppContextValue["recordDose"]>(
    (medicationId, scheduledFor, status, note) => {
      if (!user) return;
      const already = logs.find(
        (l) =>
          l.medicationId === medicationId && l.scheduledFor === scheduledFor
      );
      const log: DoseLog = {
        id: already ? already.id : uid(),
        userId: user.id,
        medicationId,
        scheduledFor,
        status,
        takenAt: status === "taken" ? new Date().toISOString() : undefined,
        note,
      };
      setLogs((prev) => {
        const idx = prev.findIndex(
          (l) =>
            l.medicationId === medicationId && l.scheduledFor === scheduledFor
        );
        const next = idx >= 0 ? [...prev] : [...prev, log];
        if (idx >= 0) next[idx] = log;
        return next;
      });
      void upsertLog(log).catch((e) => {
        console.error("Supabase upsertLog failed:", e);
        const msg = e?.message || e?.error_description || JSON.stringify(e);
        if (typeof window !== "undefined") {
          window.alert(`Could not save dose:\n\n${msg}`);
        }
      });

      // Adjust remaining doses
      let nextRemaining: number | null = null;
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id !== medicationId) return m;
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
          nextRemaining = remaining;
          return { ...m, remainingDoses: remaining };
        })
      );
      if (nextRemaining !== null) {
        void updateMedicationRow(medicationId, {
          remainingDoses: nextRemaining,
        });
      }
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
