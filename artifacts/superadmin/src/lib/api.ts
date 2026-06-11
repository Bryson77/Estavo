const API_BASE = import.meta.env.BASE_URL
  ? `${window.location.origin}/api`
  : "/api";

async function apiFetch<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data as T;
}

export interface Estate {
  id: string;
  name: string;
  address?: string;
  unitCount: number;
  subscriptionTier: "starter" | "growth" | "estate" | "enterprise";
  subscriptionStatus: "active" | "suspended" | "cancelled" | "pilot";
  isActive: boolean;
  isPilot?: boolean;
  pilotDiscountPct?: number;
  managerEmail?: string;
  monthlyAmountZar?: number;
  notes?: string;
  createdAt: string;
}

export interface PlatformStats {
  totalEstates: number;
  activeEstates: number;
  pilotEstates: number;
  suspendedEstates: number;
  totalUnits: number;
  mrrZar: number;
}

export const platformApi = {
  getEstates: (): Promise<{ estates: Estate[] }> =>
    apiFetch("/platform/estates"),

  createEstate: (data: Partial<Estate>): Promise<{ estate: Estate }> =>
    apiFetch("/platform/estates", { method: "POST", body: JSON.stringify(data) }),

  updateEstate: (id: string, data: Partial<Estate>): Promise<{ estate: Estate }> =>
    apiFetch(`/platform/estates/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  suspendEstate: (id: string): Promise<{ success: boolean }> =>
    apiFetch(`/platform/estates/${id}/suspend`, { method: "POST" }),

  getStats: (): Promise<PlatformStats> =>
    apiFetch("/platform/stats"),
};
