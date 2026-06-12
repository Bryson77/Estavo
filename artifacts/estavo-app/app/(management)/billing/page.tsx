import { CreditCard, TrendingUp } from "lucide-react";
import { PageHeader, StatCard, Badge } from "@/components/ui";

const INVOICES = [
  { month:"June 2026",     amount:"R4,500", status:"paid",    due:"1 Jun 2026" },
  { month:"May 2026",      amount:"R4,500", status:"paid",    due:"1 May 2026" },
  { month:"April 2026",    amount:"R4,500", status:"paid",    due:"1 Apr 2026" },
  { month:"March 2026",    amount:"R4,500", status:"paid",    due:"1 Mar 2026" },
  { month:"February 2026", amount:"R4,500", status:"paid",    due:"1 Feb 2026" },
];

export default function BillingPage() {
  return (
    <div className="fade-in space-y-6">
      <PageHeader
        title="Billing"
        subtitle="The Hudson Lifestyle Estate · Estate plan"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Plan"           value="Estate"        sub="Up to 500 units" />
        <StatCard label="Monthly Fee"    value="R4,500"        sub="Billed 1st of month" />
        <StatCard label="Levy Collection" value="94%"          sub="Avg this quarter" />
        <StatCard label="Next Invoice"   value="1 Jul 2026"    sub="R4,500 due" />
      </div>

      <div className="rounded-xl p-5" style={{ background:"var(--success-bg)", border:"1px solid var(--success-border)" }}>
        <div className="flex items-center gap-2">
          <CreditCard size={14} style={{ color:"var(--success-text)" }}/>
          <span className="text-[13px] font-semibold" style={{ color:"var(--success-text)" }}>
            Account in good standing · All invoices paid
          </span>
        </div>
      </div>

      <div className="rounded-xl" style={{ border:"1px solid var(--border)" }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom:"1px solid var(--border)" }}>
          <span className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Invoice History</span>
          <button className="text-[12px] cursor-pointer" style={{ color:"var(--active-text)" }}>Download all</button>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
              {["Period","Amount","Status","Due Date",""].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map(inv=>(
              <tr key={inv.month} style={{ borderBottom:"1px solid var(--border-subtle)" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--hover)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{inv.month}</td>
                <td className="px-4 py-3 font-mono" style={{ color:"var(--text)" }}>{inv.amount}</td>
                <td className="px-4 py-3"><Badge variant={inv.status as any}>{inv.status}</Badge></td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{inv.due}</td>
                <td className="px-4 py-3">
                  <button className="text-[12px] cursor-pointer" style={{ color:"var(--active-text)" }}>Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color:"var(--active-text)" }}/>
          <span className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Billing Contact</span>
        </div>
        <div className="text-[13px] space-y-1" style={{ color:"var(--text-muted)" }}>
          <div>Finance Manager</div>
          <div>billing@hudson.co.za</div>
        </div>
        <button className="mt-3 text-[12px] font-semibold cursor-pointer" style={{ color:"var(--active-text)" }}>Update contact →</button>
      </div>
    </div>
  );
}
