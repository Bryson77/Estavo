"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, BarChart2, DollarSign, ShieldCheck, Users, Settings, LogOut } from "lucide-react";

const NAV = [
  { href:"/corporate",             label:"Portfolio",   icon:Building2  },
  { href:"/corporate/analytics",   label:"Analytics",   icon:BarChart2  },
  { href:"/corporate/financials",  label:"Financials",  icon:DollarSign },
  { href:"/corporate/compliance",  label:"Compliance",  icon:ShieldCheck },
  { href:"/corporate/managers",    label:"Managers",    icon:Users      },
  { href:"/corporate/settings",    label:"Settings",    icon:Settings   },
];

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 shrink-0 flex flex-col"
        style={{ background:"var(--surface)", borderRight:"1px solid var(--border)" }}>

        <div className="px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold"
              style={{ background:"var(--accent)", color:"#FFFFFF" }}>E</div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Estavo</div>
              <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color:"var(--active-text)" }}>Corporate</div>
            </div>
          </div>
        </div>

        <div className="px-3 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
          <div className="text-[11px] font-semibold px-2 mb-0.5" style={{ color:"var(--text)" }}>3 Estates</div>
          <div className="text-[10px] px-2" style={{ color:"var(--text-dim)" }}>Portfolio View</div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = item.href === "/corporate"
              ? pathname === "/corporate"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: active ? "var(--active-bg)"  : "transparent",
                  color:      active ? "var(--active-text)" : "var(--text-muted)",
                }}>
                <Icon size={15} strokeWidth={active ? 2 : 1.5}
                  style={{ color: active ? "var(--active-text)" : "var(--text-dim)" }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3" style={{ borderTop:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
              style={{ background:"var(--accent-muted)", color:"var(--active-text)", border:"1px solid var(--border)" }}>
              BA
            </div>
            <div>
              <div className="text-[12px] font-medium" style={{ color:"var(--text)" }}>Bryson A.</div>
              <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color:"var(--text-dim)" }}>Corporate Agent</div>
            </div>
          </div>
          <button onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 text-[12px] py-1.5 rounded-lg cursor-pointer"
            style={{ background:"var(--bg)", color:"var(--text-muted)", border:"1px solid var(--border)" }}>
            <LogOut size={11} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto" style={{ background:"var(--bg)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
