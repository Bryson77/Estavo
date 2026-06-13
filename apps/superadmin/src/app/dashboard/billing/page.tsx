"use client";

import { Download, CreditCard, CircleDollarSign, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estates } from "@/lib/mock-data";
import { PageHeader, StatCard, Panel, SimpleTable, Badge, RowActions } from "@/components/shared";

export default function BillingPage() {
  return (
    <>
      <PageHeader eyebrow="Finance" title="Billing & Subscriptions" subtitle="Manage estate subscriptions and invoice history.">
        <Button variant="outline"><Download /> Export CSV</Button>
      </PageHeader>
      
      <div className="stats-grid">
        <StatCard label="Active subscriptions" value="4" note="1 setup incomplete" icon={CreditCard} />
        <StatCard label="MRR" value="R 72 000.00" note="+4.2% month on month" icon={CircleDollarSign} />
        <StatCard label="Overdue" value="1" note="R 9 800.00 outstanding" icon={AlertTriangle} alert />
        <StatCard label="Upcoming renewals" value="4" note="Due in July" icon={RefreshCw} />
      </div>

      <Panel title="Subscriptions">
        <SimpleTable 
          headers={["Estate", "Plan", "Monthly fee", "Billing contact", "Status", "Next invoice", "Actions"]} 
          rows={estates.slice(0, 4).map(e => [
            e.name, 
            "Growth", 
            e.mrr, 
            e.manager, 
            <Badge key="1" tone={e.status === "Suspended" ? "error" : "success"}>{e.status === "Suspended" ? "Overdue" : "Active"}</Badge>, 
            "01 Jul 2026", 
            <RowActions key="2" labels={["Edit", "Suspend", "Send invoice"]} />
          ])} 
        />
      </Panel>

      <Panel title="Invoice history">
        <SimpleTable 
          headers={["Estate", "Invoice #", "Date", "Amount", "Status", "Action"]} 
          rows={estates.slice(0, 4).map((e, i) => [
            e.name, 
            `INV-2026-06${12 - i}`, 
            "01 Jun 2026", 
            e.mrr, 
            <Badge key="1" tone={e.status === "Suspended" ? "error" : "success"}>{e.status === "Suspended" ? "Overdue" : "Paid"}</Badge>, 
            <Button key="2" variant="ghost" size="sm"><Download />PDF</Button>
          ])} 
        />
      </Panel>
    </>
  );
}
