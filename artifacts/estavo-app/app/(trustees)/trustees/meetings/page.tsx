"use client";

import { useState } from "react";
import { MOCK_MEETINGS, MOCK_RESOLUTIONS } from "@/lib/mock-data";
import { PageHeader, Badge } from "@/components/ui";

export default function TrusteeMeetingsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [agenda, setAgenda] = useState<typeof MOCK_MEETINGS[0] | null>(null);

  const upcoming = MOCK_MEETINGS.filter(m => m.status === "scheduled");
  const past = MOCK_MEETINGS.filter(m => m.status === "completed");

  return (
    <div className="fade-in">
      <PageHeader title="Meetings" subtitle="Upcoming meetings and resolution log" />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: "var(--surface)", display: "inline-flex" }}>
        {(["upcoming", "past"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold capitalize cursor-pointer transition-all"
            style={{
              background: tab === t ? "var(--bg)" : "transparent",
              color: tab === t ? "var(--text)" : "var(--text-muted)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "upcoming" && (
        <div className="space-y-3">
          {upcoming.map(m => (
            <div key={m.id} className="rounded-2xl" style={{ border: "1px solid var(--border)" }}>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="info">{m.type.toUpperCase()}</Badge>
                    <h3 className="text-[15px] font-semibold mt-1.5" style={{ color: "var(--text)" }}>{m.title}</h3>
                    <div className="text-[12px] mt-1" style={{ color: "var(--text-dim)" }}>
                      {m.date} · {m.time} · {m.location}
                    </div>
                    {m.rsvps > 0 && (
                      <div className="text-[12px] mt-1" style={{ color: "var(--text-dim)" }}>
                        {m.rsvps} RSVPs confirmed
                      </div>
                    )}
                  </div>
                  <button onClick={() => setAgenda(m)}
                    className="text-[12px] font-semibold cursor-pointer px-3 py-1.5 rounded-lg"
                    style={{ background: "var(--accent-muted)", color: "var(--active-text)", border: "1px solid var(--accent)" }}>
                    View Agenda →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "past" && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: "var(--text-muted)" }}>
            Resolution Log
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                  {["Ref", "Description", "Date", "Votes", "Result"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: "var(--text-dim)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_RESOLUTIONS.map(r => (
                  <tr key={r.ref} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3 font-mono text-[12px] font-semibold" style={{ color: "var(--active-text)" }}>{r.ref}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text)" }}>{r.description}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{r.date}</td>
                    <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>{r.votes}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.result === "passed" ? "success" : "danger"}>
                        {r.result === "passed" ? "✅ Passed" : "❌ Rejected"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {past.map(m => (
            <div key={m.id} className="mt-3 rounded-2xl p-5" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>{m.title}</div>
              <div className="text-[12px] mb-2" style={{ color: "var(--text-dim)" }}>{m.date}</div>
              {m.minutes && (
                <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>{m.minutes}</div>
              )}
              <button className="mt-2 text-[12px] cursor-pointer" style={{ color: "var(--active-text)" }}>Download Minutes PDF →</button>
            </div>
          ))}
        </div>
      )}

      {/* Agenda slide-over */}
      {agenda && (
        <div className="fixed inset-0 z-50 flex"
          style={{ background: "rgba(0,0,0,0.2)" }}
          onClick={e => { if (e.target === e.currentTarget) setAgenda(null); }}>
          <div className="ml-auto w-full max-w-md h-full overflow-y-auto slide-in p-6"
            style={{ background: "var(--bg)", borderLeft: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-semibold" style={{ color: "var(--text)" }}>{agenda.title}</h2>
                <div className="text-[12px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                  {agenda.date} · {agenda.time} · {agenda.location}
                </div>
              </div>
              <button onClick={() => setAgenda(null)} className="text-[20px] cursor-pointer" style={{ color: "var(--text-dim)" }}>×</button>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: "var(--text-muted)" }}>Agenda</div>
            <div className="space-y-2">
              {agenda.agenda.map((item, i) => (
                <div key={i} className="flex gap-3 py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <span className="text-[12px] font-mono text-[11px] shrink-0 mt-0.5" style={{ color: "var(--text-dim)" }}>{i + 1}</span>
                  <span className="text-[13px]" style={{ color: "var(--text)" }}>{item.replace(/^\d+\.\s/, "")}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 text-[12px] font-semibold cursor-pointer" style={{ color: "var(--active-text)" }}>
              + Propose agenda item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
