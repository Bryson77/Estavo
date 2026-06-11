"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Receipt,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/estates", label: "Estates", icon: Building2 },
  { href: "/dashboard/provision", label: "New Estate", icon: PlusCircle },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
  { href: "/dashboard/support", label: "Support Logs", icon: ShieldCheck },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
      style={{
        background: active ? "var(--sa-active-bg)" : "transparent",
        color: active ? "var(--sa-text)" : "var(--sa-text-muted)",
      }}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.5} />
      <span className="flex-1">{label}</span>
      {active && (
        <ChevronRight size={14} style={{ color: "var(--sa-text-dim)" }} />
      )}
    </Link>
  );
}

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    // For now, redirect to login
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className="w-56 shrink-0 flex flex-col"
        style={{
          background: "var(--sa-black)",
          borderRight: "1px solid var(--sa-border-subtle)",
        }}
      >
        {/* Brand */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: "1px solid var(--sa-border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: "var(--sa-text)",
                color: "var(--sa-black)",
              }}
            >
              E
            </div>
            <div>
              <div
                className="text-sm font-bold leading-tight"
                style={{ color: "var(--sa-text)" }}
              >
                EstateHQ
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.15em] font-medium"
                style={{ color: "var(--sa-text-dim)" }}
              >
                Superadmin
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <NavItem key={item.href} {...item} active={isActive} />
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid var(--sa-border-subtle)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                background: "var(--sa-card)",
                color: "var(--sa-text-secondary)",
                border: "1px solid var(--sa-border)",
              }}
            >
              SA
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-medium truncate"
                style={{ color: "var(--sa-text-secondary)" }}
              >
                admin@estatehq.co.za
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.1em]"
                style={{ color: "var(--sa-text-dim)" }}
              >
                Super Admin
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg transition-colors cursor-pointer"
            style={{
              background: "var(--sa-surface)",
              color: "var(--sa-text-muted)",
              border: "1px solid var(--sa-border-subtle)",
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--sa-bg)" }}
      >
        {children}
      </main>
    </div>
  );
}
