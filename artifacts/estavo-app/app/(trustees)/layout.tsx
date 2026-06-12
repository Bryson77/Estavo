"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Inbox, BarChart2, CalendarDays, FileText, Settings, LogOut } from "lucide-react";

const NAV = [
  { href:"/trustees",          label:"Approvals",       icon:Inbox,        badge:2 },
  { href:"/trustees/overview",  label:"Estate Overview", icon:BarChart2,    badge:0 },
  { href:"/trustees/meetings",  label:"Meetings",        icon:CalendarDays, badge:0 },
  { href:"/trustees/documents", label:"Documents",       icon:FileText,     badge:0 },
  { href:"/trustees/settings",  label:"Settings",        icon:Settings,     badge:0 },
];

export default function TrusteeLayout({ children }: { children: React.ReactNode }) {
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
              <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color:"var(--active-text)" }}>Trustee Portal</div>
            </div>
          </div>
        </div>

        <div className="px-3 pt-3 pb-2">
          <div className="text-[10px] uppercase tracking-[0.1em] font-semibold px-2 mb-1" style={{ color:"var(--text-dim)" }}>
            The Hudson Estate
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = item.href === "/trustees"
              ? pathname === "/trustees"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: active ? "var(--active-bg)"  : "transparent",
                  color:      active ? "var(--active-text)" : "var(--text-muted)",
                }}>
                <div className="flex items-center gap-3">
                  <Icon size={15} strokeWidth={active ? 2 : 1.5}
                    style={{ color: active ? "var(--active-text)" : "var(--text-dim)" }} />
                  {item.label}
                </div>
                {item.badge > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background:"var(--accent)", color:"#FFFFFF" }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3" style={{ borderTop:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
              style={{ background:"var(--accent-muted)", color:"var(--active-text)", border:"1px solid var(--border)" }}>
              JM
            </div>
            <div>
              <div className="text-[12px] font-medium" style={{ color:"var(--text)" }}>John Mokoena</div>
              <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color:"var(--text-dim)" }}>Trustee</div>
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
        <div className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
