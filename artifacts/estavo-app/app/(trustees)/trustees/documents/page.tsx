import { FileText, Download, AlertTriangle } from "lucide-react";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { PageHeader, Badge } from "@/components/ui";

function getDocStatus(doc: typeof MOCK_DOCUMENTS[0]) {
  if (doc.status === "submitted") return { label: "✅ Submitted", variant: "success" as const };
  if (!doc.expiresAt) return { label: "Valid", variant: "success" as const };
  const days = Math.ceil((doc.expiresAt.getTime() - Date.now()) / 86400000);
  if (days < 0)  return { label: "EXPIRED", variant: "danger" as const };
  if (days < 30) return { label: `Expires in ${days} days`, variant: "danger" as const };
  if (days < 60) return { label: `Expires in ${days} days`, variant: "warning" as const };
  return { label: "Valid", variant: "success" as const };
}

export default function TrusteeDocumentsPage() {
  return (
    <div className="fade-in">
      <PageHeader title="Documents" subtitle="Estate document vault — read access only" />

      <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-2 text-[12px]"
        style={{ background: "var(--neutral-bg)", border: "1px solid var(--neutral-border)", color: "var(--neutral-text)" }}>
        🔒 All documents are encrypted and access-logged. Trustees can download only. Upload access is manager / corporate only.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MOCK_DOCUMENTS.map(doc => {
          const { label, variant } = getDocStatus(doc);
          return (
            <div key={doc.id} className="rounded-xl p-4 flex items-start justify-between"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--accent-muted)" }}>
                  <FileText size={16} style={{ color: "var(--active-text)" }} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{doc.title}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                    {doc.expiresAt
                      ? `Valid until: ${doc.expiresAt.toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}`
                      : `Last updated: ${doc.updated}`}
                  </div>
                  <div className="mt-1.5">
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                </div>
              </div>
              <button className="shrink-0 ml-3 p-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <Download size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
