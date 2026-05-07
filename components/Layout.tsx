"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Pill,
  Clock,
  User as UserIcon,
  Plus,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import AddMedicationModal from "@/components/AddMedicationModal";

const NAV = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/medications", label: "Meds", icon: Pill },
  { href: "/reminders", label: "History", icon: Clock },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function Layout({
  children,
  hideFab = false,
}: {
  children: React.ReactNode;
  hideFab?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-32">
      <main className="mx-auto w-full max-w-5xl px-5 pt-8 md:px-10 md:pt-12">
        {children}
      </main>

      {/* Floating bottom nav */}
      <nav className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-3xl bg-white px-3 py-2 shadow-card sm:gap-3 sm:px-4">
        <NavItem item={NAV[0]} pathname={pathname} />
        <NavItem item={NAV[1]} pathname={pathname} />

        {/* Center FAB */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Add medication"
          className="-mt-8 mx-1 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 text-white shadow-glow transition active:scale-95"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>

        <NavItem item={NAV[2]} pathname={pathname} />
        <NavItem item={NAV[3]} pathname={pathname} />
      </nav>

      {!hideFab && (
        <AddMedicationModal open={open} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: (typeof NAV)[number];
  pathname: string;
}) {
  const Icon = item.icon;
  const active =
    pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      className={`flex w-16 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-medium transition sm:w-20 ${
        active ? "text-cyan-500" : "text-slate-400 hover:text-slate-700"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      {item.label}
    </Link>
  );
}
