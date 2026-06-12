"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Shield, Wrench, UserCheck,
  Megaphone, AlertTriangle, HardHat, CheckSquare, CreditCard,
  Settings, LogOut, Building2,
} from "lucide-react";

const NAV = [
  { href:"/dashboard",      label:"Dashboard",    icon:LayoutDashboard },
  { href:"/residents",      label:"Residents",    icon:Users },
  { href:"/gates",          label:"Gate & Access",icon:Shield },
  { href:"/maintenance",    label:"Maintenance",  icon:Wrench },
  { href:"/staff",          label:"Staff",        icon:UserCheck },
  { href:"/announcements",  label:"Announcements",icon:Megaphone },
  { href:"/emergencies",    label:"Emergencies",  icon:AlertTriangle },
  { href:"/contractors",    label:"Contractors",  icon:HardHat },
  { href:"/approvals",      label:"Approvals",    icon:CheckSquare },
  { href:"/billing",        label:"Billing",      icon:CreditCard },
  { href:"/settings",       label:"Settings",     icon:Settings },
];

function NavItem({ href, label, icon: Icon, active }: { href:string; label:string; icon:any; active:boolean }) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
      style={{
        background: active ? "var(--active-bg)"  : "transparent",
        color:      active ? "var(--active-text)" : "var(--text-muted)",
      }}>
      <Icon size={15} strokeWidth={active ? 2 : 1.5}
        style={{ color: active ? "var(--active-text)" : "var(--text-dim)" }} />
      {label}
    </Link>
  );
}

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 shrink-0 flex flex-col"
        style={{ background:"var(--surface)", borderRight:"1px solid var(--border)" }}>

        {/* Brand */}
        <div className="px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold"
              style={{ background:"var(--accent)", color:"#FFFFFF" }}>E</div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Estavo</div>
              <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color:"var(--active-text)" }}>Management</div>
            </div>
          </div>
        </div>

        {/* Estate pill */}
        <div className="px-3 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
            style={{ background:"var(--accent-muted)" }}>
            <Building2 size={12} style={{ color:"var(--active-text)" }} />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold truncate" style={{ color:"var(--active-text)" }}>
                The Hudson Estate
              </div>
              <div className="text-[10px]" style={{ color:"var(--active-text)", opacity:0.7 }}>184 units</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return <NavItem key={item.href} {...item} active={active} />;
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3" style={{ borderTop:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
              style={{ background:"var(--accent-muted)", color:"var(--active-text)", border:"1px solid var(--border)" }}>
              AK
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate" style={{ color:"var(--text)" }}>Amara Khumalo</div>
              <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color:"var(--text-dim)" }}>Manager</div>
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
