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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
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
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
      style={{
        background: active ? "var(--sa-active-bg)" : "transparent",
        color: active ? "var(--sa-active-text)" : "var(--sa-text-muted)",
      }}
    >
      <Icon
        size={16}
        strokeWidth={active ? 2 : 1.5}
        style={{ color: active ? "var(--sa-active-text)" : "var(--sa-text-dim)" }}
      />
      <span>{label}</span>
    </Link>
  );
}

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{
          background: "var(--sa-surface)",
          borderRight: "1px solid var(--sa-border)",
        }}
      >
        {/* Brand */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--sa-border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--sa-accent)", color: "#FFFFFF" }}
            >
              E
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-tight" style={{ color: "var(--sa-text)" }}>
                Estavo
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.12em] font-medium"
                style={{ color: "var(--sa-active-text)" }}
              >
                Superadmin
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return <NavItem key={item.href} {...item} active={isActive} />;
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid var(--sa-border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
              style={{
                background: "var(--sa-accent-muted)",
                color: "var(--sa-active-text)",
                border: "1px solid var(--sa-border)",
              }}
            >
              SA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate" style={{ color: "var(--sa-text)" }}>
                admin@estavo.co.za
              </div>
              <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--sa-text-dim)" }}>
                Super Admin
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 text-[12px] py-2 rounded-lg transition-colors cursor-pointer"
            style={{
              background: "var(--sa-bg)",
              color: "var(--sa-text-muted)",
              border: "1px solid var(--sa-border)",
            }}
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto" style={{ background: "var(--sa-bg)" }}>
        {children}
      </main>
    </div>
  );
}
