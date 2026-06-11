import Constants from "expo-constants";

const BASE_URL = (() => {
  if (typeof process !== "undefined" && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const replId = Constants.expoConfig?.extra?.replId ?? process.env.EXPO_PUBLIC_REPL_ID;
  const domain = Constants.expoConfig?.extra?.domain ?? process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    return `https://${domain}/api`;
  }
  return "http://localhost:8080/api";
})();

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }

  return data as T;
}

export const apiClient = {
  requestOtp: (email: string) =>
    request<{ message: string; devOtp?: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  requestPasswordSetup: (email: string) =>
    request<{ message: string }>("/auth/request-password-setup", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<{ token: string; user: any }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  getMe: (token: string) =>
    request<any>("/auth/me", { token }),

  getGates: (token: string) =>
    request<{ gates: any[] }>("/gates", { token }),

  triggerGate: (token: string, gateId: string, gateLabel: string, direction?: "entry" | "exit") =>
    request<{ success: boolean; logId: string; undoWindowSeconds: number }>("/gates/trigger", {
      method: "POST",
      token,
      body: JSON.stringify({ gateId, gateLabel, direction }),
    }),

  undoGate: (token: string, logId: string) =>
    request<{ success: boolean }>("/gates/undo", {
      method: "POST",
      token,
      body: JSON.stringify({ logId }),
    }),

  getGateActivity: (token: string) =>
    request<{ logs: any[] }>("/gates/activity", { token }),

  getGuests: (token: string) =>
    request<{ codes: any[]; activeCodes: number; maxActive: number; insideNow: number }>("/guests", { token }),

  createGuest: (token: string, data: {
    guestFirstName: string;
    guestLastName: string;
    guestPhone?: string;
    isParcel: boolean;
    durationHours: number;
    usesTotal?: number;
  }) =>
    request<{ code: any }>("/guests", { method: "POST", token, body: JSON.stringify(data) }),

  deactivateGuest: (token: string, id: string) =>
    request<{ success: boolean }>(`/guests/${id}`, { method: "DELETE", token }),

  getReports: (token: string) =>
    request<{ reports: any[]; open: number; inProgress: number; resolved: number }>("/reports", { token }),

  createReport: (token: string, data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    photoUrl?: string;
  }) =>
    request<{ report: any }>("/reports", { method: "POST", token, body: JSON.stringify(data) }),

  getCommunityPosts: (token: string) =>
    request<{ posts: any[] }>("/community/posts", { token }),

  createPost: (token: string, data: { content: string; postType: string; isAnonymous: boolean }) =>
    request<{ post: any }>("/community/posts", { method: "POST", token, body: JSON.stringify(data) }),

  getEvents: (token: string) =>
    request<{ events: any[] }>("/community/events", { token }),

  rsvpEvent: (token: string, eventId: string, response: "yes" | "no" | "maybe") =>
    request<{ success: boolean }>(`/community/events/${eventId}/rsvp`, {
      method: "POST",
      token,
      body: JSON.stringify({ response }),
    }),

  getBroadcasts: (token: string) =>
    request<{ broadcasts: any[]; unread: number }>("/community/broadcasts", { token }),

  markBroadcastRead: (token: string, id: string) =>
    request<{ success: boolean }>(`/community/broadcasts/${id}/read`, { method: "PATCH", token }),

  getAmenities: (token: string) =>
    request<{ amenities: any[] }>("/amenities", { token }),

  getMyBookings: (token: string) =>
    request<{ bookings: any[] }>("/amenities/my-bookings", { token }),

  bookAmenity: (token: string, data: { amenityId: string; slotStart: string; slotEnd: string }) =>
    request<{ booking: any }>("/amenities/book", { method: "POST", token, body: JSON.stringify(data) }),

  cancelBooking: (token: string, id: string) =>
    request<{ success: boolean }>(`/amenities/bookings/${id}`, { method: "DELETE", token }),

  triggerEmergency: (token: string) =>
    request<{ alert: any; emergencyRef: string; message: string }>("/emergency", { method: "POST", token }),

  getContractors: (token: string) =>
    request<{ contractors: any[] }>("/contractors", { token }),

  getLevyAccount: (token: string) =>
    request<{ balance: number; lastUpdated: string }>("/levy/account", { token }),

  getLevyTransactions: (token: string) =>
    request<{ transactions: any[] }>("/levy/transactions", { token }),

  seedLevyAccount: (token: string) =>
    request<{ success: boolean; message: string }>("/levy/seed", { method: "POST", token }),

  logout: (token: string) =>
    request<{ success: boolean }>("/auth/logout", { method: "POST", token }),
};
