// Supabase Edge Function: send-missed-dose-emails
// Runs on a schedule (pg_cron). For every user, recomputes today's
// expected doses in the user's timezone, finds ones that are >= 60 min
// past due with no taken/skipped log, and emails a summary via Resend.
// Deduped via the missed_dose_emails table so a dose is emailed once.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRACE_MINUTES = 60;
const MATCH_TOLERANCE_MS = 120_000; // 2 min — absorbs timestamp drift

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL =
  Deno.env.get("MISSED_DOSE_FROM_EMAIL") ?? "onboarding@resend.dev";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

type Med = {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  reminder_times: string[];
  start_date: string;
  end_date: string | null;
};
type Log = {
  medication_id: string;
  scheduled_for: string;
  status: string;
};
type Profile = {
  id: string;
  name: string;
  email: string;
  timezone: string;
};

// Minutes that `tz` is ahead of UTC at the given instant.
function tzOffsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(
    dtf.formatToParts(date).map((x) => [x.type, x.value])
  ) as Record<string, string>;
  const asUTC = Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    +p.hour,
    +p.minute,
    +p.second
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}

// Local Y/M/D and weekday for `now` in `tz`.
function localDateParts(now: Date, tz: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const p = Object.fromEntries(
    dtf.formatToParts(now).map((x) => [x.type, x.value])
  ) as Record<string, string>;
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    p.weekday
  );
  return { year: +p.year, month: +p.month, day: +p.day, weekday: wd };
}

// UTC instant for "today at HH:MM" in the user's timezone.
function scheduledInstant(
  now: Date,
  tz: string,
  hhmm: string
): Date {
  const { year, month, day } = localDateParts(now, tz);
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const naiveUTC = Date.UTC(year, month - 1, day, h || 0, m || 0, 0);
  const offset = tzOffsetMinutes(new Date(naiveUTC), tz);
  return new Date(naiveUTC - offset * 60000);
}

async function sendEmail(to: string, name: string, lines: string[]) {
  const html = `
    <div style="font-family:system-ui,sans-serif;color:#0f172a">
      <h2>Missed medication reminder</h2>
      <p>Hi ${name || "there"}, our records show you may have missed:</p>
      <ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
      <p style="color:#64748b;font-size:13px">
        Open MedRemind to mark these as taken or skipped.
      </p>
    </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `MedRemind <${FROM_EMAIL}>`,
      to: [to],
      subject: "You may have missed a medication dose",
      html,
    }),
  });
  if (!res.ok) {
    console.error("Resend error:", res.status, await res.text());
  }
}

Deno.serve(async (req) => {
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 36 * 3600_000).toISOString();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, timezone");

  let emailed = 0;

  for (const profile of (profiles ?? []) as Profile[]) {
    if (!profile.email) continue;
    const tz = profile.timezone || "UTC";

    const [{ data: meds }, { data: logs }, { data: sent }] = await Promise.all([
      supabase
        .from("medications")
        .select(
          "id, user_id, name, dosage, unit, frequency, reminder_times, start_date, end_date"
        )
        .eq("user_id", profile.id),
      supabase
        .from("dose_logs")
        .select("medication_id, scheduled_for, status")
        .eq("user_id", profile.id)
        .gte("scheduled_for", dayAgo),
      supabase
        .from("missed_dose_emails")
        .select("medication_id, scheduled_for")
        .eq("user_id", profile.id)
        .gte("scheduled_for", dayAgo),
    ]);

    const { weekday } = localDateParts(now, tz);
    const missed: { med: Med; when: Date; hhmm: string }[] = [];

    for (const med of (meds ?? []) as Med[]) {
      if (med.frequency === "asneeded") continue;
      const start = new Date(med.start_date);
      if (now < new Date(start.toDateString())) continue;
      if (med.end_date && now > new Date(med.end_date)) continue;
      if (med.frequency === "weekly" && start.getUTCDay() !== weekday) continue;

      for (const hhmm of med.reminder_times ?? []) {
        const when = scheduledInstant(now, tz, hhmm);
        const dueMs = now.getTime() - when.getTime();
        if (dueMs < GRACE_MINUTES * 60_000) continue; // not late enough
        if (dueMs > 24 * 3600_000) continue; // too old, ignore

        const handled = ((logs ?? []) as Log[]).some(
          (l) =>
            l.medication_id === med.id &&
            (l.status === "taken" || l.status === "skipped") &&
            Math.abs(
              new Date(l.scheduled_for).getTime() - when.getTime()
            ) < MATCH_TOLERANCE_MS
        );
        if (handled) continue;

        const already = ((sent ?? []) as Log[]).some(
          (s) =>
            s.medication_id === med.id &&
            Math.abs(
              new Date(s.scheduled_for).getTime() - when.getTime()
            ) < MATCH_TOLERANCE_MS
        );
        if (already) continue;

        missed.push({ med, when, hhmm });
      }
    }

    if (missed.length === 0) continue;

    const lines = missed.map(
      (x) =>
        `${x.med.name} — ${x.med.dosage} ${x.med.unit} (scheduled ${x.hhmm})`
    );
    await sendEmail(profile.email, profile.name, lines);

    await supabase.from("missed_dose_emails").insert(
      missed.map((x) => ({
        user_id: profile.id,
        medication_id: x.med.id,
        scheduled_for: x.when.toISOString(),
      }))
    );
    emailed += missed.length;
  }

  return new Response(JSON.stringify({ ok: true, emailed }), {
    headers: { "Content-Type": "application/json" },
  });
});
