import React, { useState } from "react";

export default function SupportLogsPage() {
  const [logs] = useState([
    { id: "1", action: "Estate provisioned", estate: "Hillcrest Estate", admin: "admin@estatehq.co.za", createdAt: new Date().toISOString(), notes: "Pilot client — 50% discount" },
    { id: "2", action: "Manager password reset", estate: "Pinehurst Village", admin: "admin@estatehq.co.za", createdAt: new Date(Date.now() - 86400000).toISOString(), notes: "" },
    { id: "3", action: "Suspension lifted", estate: "Riverside Estate", admin: "admin@estatehq.co.za", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), notes: "Payment received — account reactivated" },
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Support Logs</h1>
        <p className="text-slate-400 text-sm mt-1">Superadmin actions and support interventions</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No support actions logged yet.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-5 hover:bg-slate-800/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-white">{log.action}</span>
                      <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-md">{log.estate}</span>
                    </div>
                    {log.notes && (
                      <p className="text-xs text-slate-500 mt-1">{log.notes}</p>
                    )}
                    <div className="text-xs text-slate-600 mt-2">By {log.admin}</div>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-amber-950 border border-amber-800 rounded-xl p-4">
        <p className="text-amber-300 text-sm font-medium">Live support logs</p>
        <p className="text-amber-500 text-xs mt-1">
          Once the platform Supabase project is configured with the <code className="bg-amber-900/50 px-1 rounded">support_logs</code> table,
          actions will appear here automatically. The <code className="bg-amber-900/50 px-1 rounded">VITE_SUPABASE_PLATFORM_URL</code> and{" "}
          <code className="bg-amber-900/50 px-1 rounded">VITE_SUPABASE_PLATFORM_ANON_KEY</code> environment variables must be set.
        </p>
      </div>
    </div>
  );
}
