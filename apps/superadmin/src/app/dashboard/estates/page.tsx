"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { estates } from "@/lib/mock-data";
import { PageHeader, Panel, EstateTable } from "@/components/shared";
import { Wizard } from "@/components/wizard";

export default function EstatesPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [wizard, setWizard] = useState(false);
  
  const shown = estates.filter(e => 
    (filter === "All" || (filter === "Needs Attention" && e.health < 70) || e.status === filter) &&
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <PageHeader eyebrow="Portfolio" title="Estates" subtitle="Manage every estate connected to the Estavo platform.">
        <Button onClick={() => setWizard(true)}><Plus />Add new estate</Button>
      </PageHeader>
      
      <div className="toolbar">
        <div className="chips">
          {["All", "Active", "Suspended", "Needs Attention"].map(x => (
            <Button key={x} variant={filter === x ? "default" : "outline"} size="sm" onClick={() => setFilter(x)}>
              {x}
            </Button>
          ))}
        </div>
        <label className="search">
          <Search />
          <Input placeholder="Search estates..." value={query} onChange={e => setQuery(e.target.value)} />
        </label>
      </div>

      <Panel title={`${shown.length} estates`} action={<Button variant="outline" size="sm"><SlidersHorizontal />Filters</Button>}>
        <EstateTable />
      </Panel>
      
      {wizard && <Wizard close={() => setWizard(false)} />}
    </>
  );
}
