"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Building2, ChevronLeft, ChevronRight,
  CreditCard, Ellipsis, LayoutDashboard, Menu,
  Settings, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { id: "estates", label: "Estates", icon: Building2, path: "/dashboard/estates" },
  { 
    label: "Analytics", 
    icon: BarChart3, 
    children: [
      { id: "health", label: "Health & Performance", path: "/dashboard/health" },
      { id: "revenue", label: "Revenue & Financials", path: "/dashboard/revenue" },
      { id: "errors", label: "System Errors & Failures", path: "/dashboard/errors" }
    ]
  },
  { id: "staff", label: "Staff & Managers", icon: Users, path: "/dashboard/staff" },
  { id: "billing", label: "Billing & Subscriptions", icon: CreditCard, path: "/dashboard/billing" },
  { id: "settings", label: "Platform Settings", icon: Settings, path: "/dashboard/settings" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);

  // Derive current view from pathname to highlight nav
  const isActive = (path: string) => pathname === path;

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand"><span>E</span>{!collapsed && <b>ESTAVO</b>}</div>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <div key={item.label} className="nav-group">
              {"path" in item && item.path ? (
                <Link href={item.path} className={isActive(item.path) ? "active" : ""}>
                  <button className={isActive(item.path) ? "active" : ""} tabIndex={-1}>
                    <item.icon /><span>{item.label}</span>
                  </button>
                </Link>
              ) : (
                <div className="nav-parent"><item.icon /><span>{item.label}</span></div>
              )}
              {"children" in item && item.children && (
                <div className="nav-children">
                  {item.children.map(child => (
                    <Link key={child.id} href={child.path}>
                      <button className={isActive(child.path) ? "active" : ""} tabIndex={-1}>
                        {child.label}
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">BM</div>
          {!collapsed && <div><b>Bryson Mabilo</b><span>Superadmin</span></div>}
          <Ellipsis />
        </div>
      </aside>

      {mobile && <button className="mobile-scrim" onClick={() => setMobile(false)} aria-label="Close menu" />}

      <main className="app-main">
        <div className="mobile-header">
          <Button variant="ghost" size="icon" onClick={() => setMobile(true)}>
            <Menu />
          </Button>
          <div className="brand"><span>E</span><b>ESTAVO</b></div>
          <div className="avatar">BM</div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
