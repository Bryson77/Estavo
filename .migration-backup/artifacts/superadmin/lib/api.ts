import { supabase } from "./supabase";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "/api");

/** Gets the current platform-project access token from the active Supabase session. */
async function getToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data as T;
}

export interface Estate {
  id: string;
  appEstateId: string;
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
    apiFetch("/platform/estates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEstate: (
    id: string,
    data: Partial<Estate>
  ): Promise<{ success: boolean }> =>
    apiFetch(`/platform/estates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  suspendEstate: (id: string): Promise<{ success: boolean }> =>
    apiFetch(`/platform/estates/${id}/suspend`, { method: "POST" }),

  getStats: (): Promise<PlatformStats> => apiFetch("/platform/stats"),
};
