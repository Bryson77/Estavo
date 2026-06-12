"use client";

import { useState } from "react";
import { Check, X, MessageSquare, Paperclip } from "lucide-react";
import { MOCK_APPROVALS } from "@/lib/mock-data";
import { PageHeader, Badge, PillFilter, ApprovalTypeBadge, Btn } from "@/components/ui";

const FILTERS = ["All","Pending","Approved","Rejected"];

export default function TrusteeApprovalsPage() {
  const [filter, setFilter] = useState("Pending");
  const [moreInfo, setMoreInfo] = useState<string | null>(null);
  const [voted, setVoted] = useState<Record<string, string>>({});

  const filtered = MOCK_APPROVALS.filter(a =>
    filter === "All" || a.status === filter.toLowerCase() || (filter === "Rejected" && a.status === "rejected")
  );
  const pending = MOCK_APPROVALS.filter(a => a.status === "pending").length;

  return (
    <div className="fade-in">
      <PageHeader
        title="Approvals"
        subtitle={`${pending} pending decision${pending !== 1 ? "s" : ""}`}
      />

      <div className="mb-5">
        <PillFilter options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <div className="space-y-4">
        {filtered.map(approval => {
          const myVote = voted[approval.id];
          const isDone = !!myVote || approval.status !== "pending";

          return (
            <div key={approval.id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                border: `1px solid ${isDone ? "var(--border)" : "var(--border-strong)"}`,
                opacity: isDone ? 0.7 : 1,
              }}>
              {/* Header */}
              <div className="px-5 py-4" style={{ background: isDone ? "var(--surface)" : "var(--bg)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ApprovalTypeBadge type={approval.type} />
                    <Badge variant={
                      myVote ? (myVote === "approved" ? "approved" : myVote === "rejected" ? "rejected" : "info")
                        : (approval.status === "pending" ? "pending" : approval.status === "approved" ? "approved" : approval.status === "rejected" ? "rejected" : "info")
                    }>
                      {myVote ? `You voted: ${myVote}` : approval.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>{approval.submitted}</span>
                </div>
                <h3 className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>{approval.title}</h3>
                {approval.amount && (
                  <div className="text-[13px] font-mono font-semibold mt-1" style={{ color: "var(--active-text)" }}>
                    R{approval.amount.toLocaleString()}
                  </div>
                )}
                <div className="text-[12px] mt-1" style={{ color: "var(--text-dim)" }}>
                  Submitted by Amara Khumalo · Requires {approval.required} of {approval.trusteeVotes.length} trustee votes
                </div>
              </div>

              {/* AI Summary */}
              {approval.aiSummary && (
                <div className="px-5 py-3" style={{ background: "var(--info-bg)", borderTop: "1px solid var(--info-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: "var(--info-text)" }}>
                    AI Summary
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--info-text)" }}>
                    {approval.aiSummary}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {approval.attachments.length > 0 && (
                <div className="px-5 py-3 flex gap-2 flex-wrap" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  {approval.attachments.map(f => (
                    <div key={f} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      <Paperclip size={10} />{f}
                    </div>
                  ))}
                </div>
              )}

              {/* Vote status */}
              <div className="px-5 py-3 flex items-center gap-3" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--surface)" }}>
                <span className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>Votes:</span>
                {approval.trusteeVotes.map((v, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-[12px]" style={{ color: "var(--text)" }}>{v.name.split(" ")[0]}</span>
                    <span className="text-[12px]">
                      {v.status === "approved" ? "✅" : v.status === "rejected" ? "❌" : v.status === "more_info" ? "❓" : "⏳"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {!isDone && (
                <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                  {moreInfo === approval.id ? (
                    <div className="space-y-2">
                      <textarea rows={2} className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
                        placeholder="What information do you need?"
                        style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text)", outline: "none" }} />
                      <div className="flex gap-2">
                        <Btn variant="secondary" size="sm" onClick={() => setMoreInfo(null)}>Cancel</Btn>
                        <Btn variant="primary" size="sm" onClick={() => { setVoted(v => ({ ...v, [approval.id]: "more_info" })); setMoreInfo(null); }}>
                          Submit Request
                        </Btn>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setVoted(v => ({ ...v, [approval.id]: "approved" }))}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all"
                        style={{ background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid var(--success-border)" }}>
                        <Check size={14} strokeWidth={2.5} /> Approve
                      </button>
                      <button onClick={() => setVoted(v => ({ ...v, [approval.id]: "rejected" }))}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer"
                        style={{ background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-border)" }}>
                        <X size={14} strokeWidth={2.5} /> Reject
                      </button>
                      <button onClick={() => setMoreInfo(approval.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
                        style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        <MessageSquare size={13} /> More Info
                      </button>
                    </div>
                  )}
                  {myVote && (
                    <div className="mt-2 text-[12px] text-center" style={{ color: "var(--text-dim)" }}>
                      ✓ Vote recorded · {new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
