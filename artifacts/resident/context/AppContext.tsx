import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../lib/api";

export interface GuestCode {
  id: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  isParcel: boolean;
  pinCode: string;
  qrPayload: string;
  validFrom: string;
  validUntil: string;
  usesRemaining: number;
  usesTotal: number;
  isActive: boolean;
  createdAt: string;
}

export interface MaintenanceReport {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: "maintenance" | "security" | "urgent" | "general";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GateActivity {
  id: string;
  gateLabel: string;
  direction: "entry" | "exit";
  triggeredAt: string;
  status: "success" | "failed" | "cancelled";
}

export interface CommunityPost {
  id: string;
  content: string;
  isAnonymous: boolean;
  postType: string;
  commentCount: number;
  viewCount: number;
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  attendeeCount: number;
  userRsvp: "yes" | "no" | "maybe" | null;
  status: string;
}

export interface Amenity {
  id: string;
  name: string;
  description?: string;
  availableDays?: string[];
  availableFrom?: string;
  availableUntil?: string;
  slotDurationMins: number;
}

export interface Contractor {
  id: string;
  name: string;
  description?: string;
  tradeCategories?: string[];
  phone?: string;
  whatsapp?: string;
  rating?: number | null;
  jobCount?: number;
  avgResponseMins?: number;
  isVerified?: boolean;
}

export interface ManagementBroadcast {
  id: string;
  subject?: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

interface AppContextValue {
  guestCodes: GuestCode[];
  reports: MaintenanceReport[];
  gateActivity: GateActivity[];
  posts: CommunityPost[];
  events: CommunityEvent[];
  amenities: Amenity[];
  contractors: Contractor[];
  broadcasts: ManagementBroadcast[];
  unreadBroadcasts: number;
  guestStats: { activeCodes: number; maxActive: number; insideNow: number };
  reportStats: { open: number; inProgress: number; resolved: number };
  isLoading: boolean;
  error: string | null;
  refreshGuests: () => Promise<void>;
  refreshReports: () => Promise<void>;
  refreshGateActivity: () => Promise<void>;
  refreshCommunity: () => Promise<void>;
  refreshBroadcasts: () => Promise<void>;
  addGuestCode: (data: {
    guestFirstName: string;
    guestLastName: string;
    guestPhone?: string;
    isParcel: boolean;
    durationHours: number;
  }) => Promise<GuestCode>;
  deactivateGuestCode: (id: string) => Promise<void>;
  addReport: (data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    photoUri?: string;
  }) => Promise<MaintenanceReport>;
  addGateActivity: (activity: Omit<GateActivity, "id">) => void;
  createPost: (data: { content: string; postType: string; isAnonymous: boolean }) => Promise<void>;
  rsvpEvent: (eventId: string, response: "yes" | "no" | "maybe") => Promise<void>;
  triggerEmergency: () => Promise<{ emergencyRef: string; message: string }>;
  markBroadcastRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();

  const [guestCodes, setGuestCodes] = useState<GuestCode[]>([]);
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [gateActivity, setGateActivity] = useState<GateActivity[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [broadcasts, setBroadcasts] = useState<ManagementBroadcast[]>([]);
  const [unreadBroadcasts, setUnreadBroadcasts] = useState(0);
  const [guestStats, setGuestStats] = useState({ activeCodes: 0, maxActive: 10, insideNow: 0 });
  const [reportStats, setReportStats] = useState({ open: 0, inProgress: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshGuests = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiClient.getGuests(token);
      setGuestCodes(data.codes ?? []);
      setGuestStats({ activeCodes: data.activeCodes, maxActive: data.maxActive, insideNow: data.insideNow });
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  const refreshReports = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiClient.getReports(token);
      setReports(data.reports ?? []);
      setReportStats({ open: data.open, inProgress: data.inProgress, resolved: data.resolved });
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  const refreshGateActivity = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiClient.getGateActivity(token);
      setGateActivity(data.logs ?? []);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  const refreshCommunity = useCallback(async () => {
    if (!token) return;
    try {
      const [postsData, eventsData, amenitiesData, contractorsData] = await Promise.all([
        apiClient.getCommunityPosts(token),
        apiClient.getEvents(token),
        apiClient.getAmenities(token),
        apiClient.getContractors(token),
      ]);
      setPosts(postsData.posts ?? []);
      setEvents(eventsData.events ?? []);
      setAmenities(amenitiesData.amenities ?? []);
      setContractors(contractorsData.contractors ?? []);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  const refreshBroadcasts = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiClient.getBroadcasts(token);
      setBroadcasts(data.broadcasts ?? []);
      setUnreadBroadcasts(data.unread ?? 0);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    Promise.all([
      refreshGuests(),
      refreshReports(),
      refreshGateActivity(),
      refreshCommunity(),
      refreshBroadcasts(),
    ]).finally(() => setIsLoading(false));
  }, [token]);

  const addGuestCode = useCallback(async (data: {
    guestFirstName: string;
    guestLastName: string;
    guestPhone?: string;
    isParcel: boolean;
    durationHours: number;
  }): Promise<GuestCode> => {
    if (!token) throw new Error("Not authenticated");
    const result = await apiClient.createGuest(token, data);
    await refreshGuests();
    return result.code;
  }, [token, refreshGuests]);

  const deactivateGuestCode = useCallback(async (id: string) => {
    if (!token) throw new Error("Not authenticated");
    await apiClient.deactivateGuest(token, id);
    await refreshGuests();
  }, [token, refreshGuests]);

  const addReport = useCallback(async (data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    photoUri?: string;
  }): Promise<MaintenanceReport> => {
    if (!token) throw new Error("Not authenticated");
    const result = await apiClient.createReport(token, {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      photoUrl: data.photoUri,
    });
    await refreshReports();
    return result.report;
  }, [token, refreshReports]);

  const addGateActivity = useCallback((activity: Omit<GateActivity, "id">) => {
    const newActivity: GateActivity = { ...activity, id: Date.now().toString() };
    setGateActivity(prev => [newActivity, ...prev].slice(0, 50));
  }, []);

  const createPost = useCallback(async (data: { content: string; postType: string; isAnonymous: boolean }) => {
    if (!token) throw new Error("Not authenticated");
    await apiClient.createPost(token, data);
    await refreshCommunity();
  }, [token, refreshCommunity]);

  const rsvpEvent = useCallback(async (eventId: string, response: "yes" | "no" | "maybe") => {
    if (!token) throw new Error("Not authenticated");
    await apiClient.rsvpEvent(token, eventId, response);
    setEvents(prev => prev.map(e =>
      e.id === eventId ? {
        ...e,
        userRsvp: response,
        attendeeCount: response === "yes" ? e.attendeeCount + (e.userRsvp !== "yes" ? 1 : 0)
          : e.attendeeCount - (e.userRsvp === "yes" ? 1 : 0),
      } : e
    ));
  }, [token]);

  const triggerEmergency = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    const result = await apiClient.triggerEmergency(token);
    return { emergencyRef: result.emergencyRef, message: result.message };
  }, [token]);

  const markBroadcastRead = useCallback(async (id: string) => {
    if (!token) return;
    await apiClient.markBroadcastRead(token, id);
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, isRead: true } : b));
    setUnreadBroadcasts(prev => Math.max(0, prev - 1));
  }, [token]);

  return (
    <AppContext.Provider value={{
      guestCodes,
      reports,
      gateActivity,
      posts,
      events,
      amenities,
      contractors,
      broadcasts,
      unreadBroadcasts,
      guestStats,
      reportStats,
      isLoading,
      error,
      refreshGuests,
      refreshReports,
      refreshGateActivity,
      refreshCommunity,
      refreshBroadcasts,
      addGuestCode,
      deactivateGuestCode,
      addReport,
      addGateActivity,
      createPost,
      rsvpEvent,
      triggerEmergency,
      markBroadcastRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
