"use client";

import { useState } from "react";
import { ChevronDown, Download, CircleDollarSign, TrendingUp, Receipt, WalletCards, BarChart3, Gauge, Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { estates, months } from "@/lib/mock-data";
import { PageHeader, StatCard, Panel, SimpleTable, Badge, RowActions, MiniTooltip } from "@/components/shared";

function DualBar() {
  return (
    <div className="chart-box">
      <ResponsiveContainer>
        <BarChart data={months}>
          <XAxis dataKey="month" />
          <YAxis hide />
          <Tooltip content={<MiniTooltip />} />
          <Bar dataKey="revenue" fill="var(--chart-foreground)" />
          <Bar dataKey="expenses" fill="var(--chart-muted)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineOnly() {
  return (
    <div className="chart-box">
      <ResponsiveContainer>
        <LineChart data={months}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis hide />
          <Tooltip content={<MiniTooltip />} />
          <Line type="monotone" dataKey="profit" stroke="var(--chart-foreground)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenuePie() {
  return (
    <div className="chart-box">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={<MiniTooltip />} />
          <Pie data={estates.slice(0, 4)} dataKey="units" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={3}>
            {estates.slice(0, 4).map((_, i) => (
              <Cell key={i} fill={["var(--chart-foreground)", "var(--chart-muted)", "var(--muted-foreground)", "var(--border-strong)"][i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function RevenuePage() {
  const [expenseOpen, setExpenseOpen] = useState(false);

  return (
    <>
      <PageHeader eyebrow="Analytics" title="Revenue & Financials" subtitle="Track portfolio revenue, expenses and profitability.">
        <Button variant="outline">June 2026 <ChevronDown /></Button>
        <Button variant="outline"><Download /> CSV</Button>
        <Button variant="outline"><Download /> PDF</Button>
      </PageHeader>
      
      <div className="stats-grid stats-grid-six">
        <StatCard label="MRR" value="R 72 000.00" note="June 2026" icon={CircleDollarSign} />
        <StatCard label="ARR" value="R 864 000.00" note="Annualised" icon={TrendingUp} />
        <StatCard label="Expenses" value="R 20 100.00" note="This month" icon={Receipt} />
        <StatCard label="Net profit" value="R 51 900.00" note="72.1% margin" icon={WalletCards} />
        <StatCard label="YTD revenue" value="R 393 000.00" note="Jan — Jun" icon={BarChart3} />
        <StatCard label="YTD net profit" value="R 272 200.00" note="69.3% margin" icon={Gauge} />
      </div>

      <Panel title="Revenue breakdown">
        <SimpleTable 
          headers={["Estate", "Plan", "Monthly fee", "Status", "Last payment", "Actions"]} 
          rows={estates.slice(0, 4).map(e => [
            e.name, 
            "Growth", 
            e.mrr, 
            <Badge key="badge" tone={e.status === "Suspended" ? "error" : "success"}>{e.status === "Suspended" ? "Overdue" : "Paid"}</Badge>, 
            "01 Jun 2026", 
            <RowActions key="actions" labels={["Edit amount", "Send reminder"]} />
          ])} 
        />
      </Panel>

      <div className="section-heading">
        <div>
          <h2>Expense ledger</h2>
          <p>Operational expenses recorded this month.</p>
        </div>
        <Button onClick={() => setExpenseOpen(true)}><Plus /> Add expense</Button>
      </div>

      <Panel title="June expenses">
        <SimpleTable 
          headers={["Date", "Description", "Category", "Amount", "Added by", "Actions"]} 
          rows={[
            ["10 Jun 2026", "Cloud infrastructure", "Infrastructure", "R 9 800.00", "Bryson Mabilo", <RowActions key="1" labels={["Edit", "Delete"]} />],
            ["05 Jun 2026", "Messaging services", "Software", "R 3 240.00", "N. Mahlangu", <RowActions key="2" labels={["Edit", "Delete"]} />],
            ["01 Jun 2026", "Support contractor", "Staff", "R 7 060.00", "Bryson Mabilo", <RowActions key="3" labels={["Edit", "Delete"]} />]
          ]} 
        />
      </Panel>

      <div className="chart-grid-three">
        <Panel title="Revenue vs expenses"><DualBar /></Panel>
        <Panel title="Net profit trend"><LineOnly /></Panel>
        <Panel title="Revenue by estate"><RevenuePie /></Panel>
      </div>
    </>
  );
}
