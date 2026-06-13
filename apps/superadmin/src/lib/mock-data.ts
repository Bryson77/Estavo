export const estates = [
  { name: "Kyalami Hills", province: "Gauteng", units: 248, health: 94, manager: "Sipho Dlamini", gate: "Online", mrr: "R 18 500.00", status: "Active", adoption: 89 },
  { name: "Waterfall Ridge", province: "Gauteng", units: 186, health: 82, manager: "Thandi Nkosi", gate: "Online", mrr: "R 14 200.00", status: "Active", adoption: 76 },
  { name: "Atlantic Terraces", province: "Western Cape", units: 310, health: 71, manager: "Lisa Adams", gate: "Degraded", mrr: "R 22 000.00", status: "Active", adoption: 64 },
  { name: "Umhlanga Gardens", province: "KwaZulu-Natal", units: 122, health: 57, manager: "Mandla Zulu", gate: "Offline", mrr: "R 9 800.00", status: "Suspended", adoption: 52 },
  { name: "Silver Lakes North", province: "Gauteng", units: 96, health: 68, manager: "Unassigned", gate: "Pending", mrr: "R 7 500.00", status: "Setup Incomplete", adoption: 41 },
];

export const months = [
  { month: "Jan", revenue: 58800, expenses: 17800, profit: 41000, tickets: 142, resolution: 18 },
  { month: "Feb", revenue: 61200, expenses: 19400, profit: 41800, tickets: 128, resolution: 16 },
  { month: "Mar", revenue: 64500, expenses: 21100, profit: 43400, tickets: 153, resolution: 14 },
  { month: "Apr", revenue: 66700, expenses: 18900, profit: 47800, tickets: 119, resolution: 13 },
  { month: "May", revenue: 69800, expenses: 22600, profit: 47200, tickets: 136, resolution: 12 },
  { month: "Jun", revenue: 72000, expenses: 20100, profit: 51900, tickets: 108, resolution: 10 },
];

export const errors = [
  { time: "12 Jun 2026 · 14:32", severity: "Critical", category: "Gate Offline", description: "North vehicle gate connection lost", estate: "Umhlanga Gardens", status: "Open" },
  { time: "12 Jun 2026 · 13:18", severity: "Warning", category: "Guest Code", description: "SMS delivery failed after 3 attempts", estate: "Atlantic Terraces", status: "Open" },
  { time: "12 Jun 2026 · 11:04", severity: "Warning", category: "Login Anomaly", description: "Multiple failed manager login attempts", estate: "Silver Lakes North", status: "Investigating" },
  { time: "12 Jun 2026 · 09:47", severity: "Critical", category: "Billing Failure", description: "Monthly subscription payment failed", estate: "Umhlanga Gardens", status: "Open" },
  { time: "11 Jun 2026 · 17:22", severity: "Info", category: "App Crash", description: "Resident app crash report received", estate: "Kyalami Hills", status: "Resolved" },
];
