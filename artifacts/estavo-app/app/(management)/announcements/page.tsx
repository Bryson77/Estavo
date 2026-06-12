"use client";

import { useState } from "react";
import { Plus, Send, Clock } from "lucide-react";
import { MOCK_ANNOUNCEMENTS } from "@/lib/mock-data";
import { PageHeader, Badge, Btn } from "@/components/ui";

const PRIORITY_VARIANT: Record<string, "danger"|"warning"|"info"> = {
  urgent:"danger", important:"warning", info:"info",
};

export default function AnnouncementsPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [priority, setPriority] = useState("info");

  const sent = MOCK_ANNOUNCEMENTS.filter(a=>a.status==="sent");
  const scheduled = MOCK_ANNOUNCEMENTS.filter(a=>a.status==="scheduled");

  return (
    <div className="fade-in">
      <PageHeader
        title="Announcements"
        subtitle="Communicate with residents and staff"
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm">Templates</Btn>
            <Btn variant="primary" size="sm" onClick={()=>setShowCompose(true)}><Plus size={13}/> Compose</Btn>
          </div>
        }
      />

      {scheduled.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color:"var(--text-muted)" }}>
            Scheduled ({scheduled.length})
          </h2>
          {scheduled.map(a=>(
            <div key={a.id} className="flex items-center justify-between px-4 py-3 rounded-xl mb-2"
              style={{ background:"var(--accent-muted)", border:"1px solid var(--accent)" }}>
              <div className="flex items-center gap-3">
                <Clock size={14} style={{ color:"var(--active-text)" }}/>
                <div>
                  <div className="text-[13px] font-semibold" style={{ color:"var(--active-text)" }}>{a.title}</div>
                  <div className="text-[11px]" style={{ color:"var(--active-text)", opacity:0.7 }}>
                    → {a.sentTo} · {a.scheduledFor}
                  </div>
                </div>
              </div>
              <button className="text-[12px] cursor-pointer" style={{ color:"var(--active-text)" }}>Cancel</button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color:"var(--text-muted)" }}>
        Sent History
      </h2>
      <div className="space-y-2">
        {sent.map(a=>(
          <div key={a.id} className="flex items-center justify-between px-4 py-4 rounded-xl"
            style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <Badge variant={PRIORITY_VARIANT[a.priority] ?? "neutral"}>{a.priority}</Badge>
              <div>
                <div className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>{a.title}</div>
                <div className="text-[11px] mt-0.5" style={{ color:"var(--text-dim)" }}>
                  {a.sentTo} · {a.sentAt} · {a.opens} opened
                </div>
              </div>
            </div>
            <button className="text-[12px] cursor-pointer" style={{ color:"var(--active-text)" }}>View →</button>
          </div>
        ))}
      </div>

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background:"rgba(0,0,0,0.3)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowCompose(false); }}>
          <div className="rounded-2xl p-6 w-full max-w-lg slide-in"
            style={{ background:"var(--bg)", border:"1px solid var(--border)" }}>
            <h2 className="text-[16px] font-semibold mb-5" style={{ color:"var(--text)" }}>
              <Send size={15} className="inline mr-2" style={{ color:"var(--active-text)" }}/>
              Compose Announcement
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Title *</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-[13px]" placeholder="e.g. Pool maintenance Friday"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Message *</label>
                <textarea rows={4} className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none" placeholder="Write your message…"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Priority</label>
                  <select value={priority} onChange={e=>setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] cursor-pointer"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}>
                    <option value="info">Info</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Send to</label>
                  <select className="w-full px-3 py-2.5 rounded-lg text-[13px] cursor-pointer"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}>
                    <option>All residents</option>
                    <option>Staff only</option>
                    <option>All</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Channel</label>
                <div className="flex gap-2">
                  {["In-app push","Email","Both"].map(c=>(
                    <button key={c} className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer"
                      style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-muted)" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Btn variant="secondary" onClick={()=>setShowCompose(false)}>Cancel</Btn>
              <Btn variant="secondary">Schedule</Btn>
              <Btn variant="primary" onClick={()=>setShowCompose(false)}><Send size={13}/> Send Now</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
