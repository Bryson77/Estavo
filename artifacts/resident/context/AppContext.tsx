import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ResidentProfile {
  id: string;
  firstName: string;
  lastName: string;
  unitNumber: string;
  estateName: string;
  estateAddress: string;
  email: string;
  phone: string;
  accountStanding: "good" | "arrears";
  avatarInitials: string;
}

export interface GuestCode {
  id: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  isParcel: boolean;
  pinCode: string;
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
  status: "success" | "failed";
}

interface AppContextValue {
  profile: ResidentProfile;
  guestCodes: GuestCode[];
  reports: MaintenanceReport[];
  gateActivity: GateActivity[];
  addGuestCode: (code: Omit<GuestCode, "id" | "createdAt">) => void;
  deactivateGuestCode: (id: string) => void;
  addReport: (report: Omit<MaintenanceReport, "id" | "ticketNumber" | "createdAt" | "updatedAt">) => void;
  addGateActivity: (activity: Omit<GateActivity, "id">) => void;
  isLoaded: boolean;
}

const defaultProfile: ResidentProfile = {
  id: "resident-001",
  firstName: "James",
  lastName: "Hartley",
  unitNumber: "14",
  estateName: "Greenfield Estate",
  estateAddress: "12 Estate Drive, Sandton, Gauteng",
  email: "james.hartley@email.com",
  phone: "+27 82 555 0142",
  accountStanding: "good",
  avatarInitials: "JH",
};

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  GUESTS: "@estatehq_guests",
  REPORTS: "@estatehq_reports",
  GATE_ACTIVITY: "@estatehq_gate_activity",
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTicket(id: string): string {
  return "TKT-" + id.substr(0, 8).toUpperCase();
}

const INITIAL_GUESTS: GuestCode[] = [
  {
    id: "g1",
    guestFirstName: "Sarah",
    guestLastName: "Thompson",
    guestPhone: "+27 83 444 1122",
    isParcel: false,
    pinCode: "847261",
    validFrom: new Date(Date.now() - 3600000).toISOString(),
    validUntil: new Date(Date.now() + 18 * 3600000).toISOString(),
    usesRemaining: 2,
    usesTotal: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "g2",
    guestFirstName: "Parcel",
    guestLastName: "Delivery",
    guestPhone: "",
    isParcel: true,
    pinCode: "332198",
    validFrom: new Date(Date.now() - 7200000).toISOString(),
    validUntil: new Date(Date.now() + 2 * 3600000).toISOString(),
    usesRemaining: 1,
    usesTotal: 1,
    isActive: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const INITIAL_REPORTS: MaintenanceReport[] = [
  {
    id: "r1",
    ticketNumber: "TKT-R1000001",
    title: "Streetlight on Block C not working",
    description: "The streetlight near the entrance to Block C has been off for 3 days.",
    category: "maintenance",
    priority: "medium",
    status: "in_progress",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "r2",
    ticketNumber: "TKT-R1000002",
    title: "Pool pump making strange noise",
    description: "The main pool pump has been making a grinding noise since Saturday morning.",
    category: "maintenance",
    priority: "high",
    status: "open",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const INITIAL_GATE_ACTIVITY: GateActivity[] = [
  {
    id: "ga1",
    gateLabel: "Main Vehicle Gate",
    direction: "entry",
    triggeredAt: new Date(Date.now() - 1800000).toISOString(),
    status: "success",
  },
  {
    id: "ga2",
    gateLabel: "Pedestrian Gate",
    direction: "exit",
    triggeredAt: new Date(Date.now() - 5400000).toISOString(),
    status: "success",
  },
  {
    id: "ga3",
    gateLabel: "Main Vehicle Gate",
    direction: "entry",
    triggeredAt: new Date(Date.now() - 86400000).toISOString(),
    status: "success",
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [guestCodes, setGuestCodes] = useState<GuestCode[]>([]);
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [gateActivity, setGateActivity] = useState<GateActivity[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [guestsRaw, reportsRaw, gateRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.GUESTS),
          AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
          AsyncStorage.getItem(STORAGE_KEYS.GATE_ACTIVITY),
        ]);
        setGuestCodes(guestsRaw ? JSON.parse(guestsRaw) : INITIAL_GUESTS);
        setReports(reportsRaw ? JSON.parse(reportsRaw) : INITIAL_REPORTS);
        setGateActivity(gateRaw ? JSON.parse(gateRaw) : INITIAL_GATE_ACTIVITY);
      } catch {
        setGuestCodes(INITIAL_GUESTS);
        setReports(INITIAL_REPORTS);
        setGateActivity(INITIAL_GATE_ACTIVITY);
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  const persistGuests = useCallback(async (updated: GuestCode[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(updated));
  }, []);

  const persistReports = useCallback(async (updated: MaintenanceReport[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  }, []);

  const persistGate = useCallback(async (updated: GateActivity[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.GATE_ACTIVITY, JSON.stringify(updated));
  }, []);

  const addGuestCode = useCallback(
    (code: Omit<GuestCode, "id" | "createdAt">) => {
      const newCode: GuestCode = {
        ...code,
        id: generateId(),
        pinCode: code.pinCode || generatePin(),
        createdAt: new Date().toISOString(),
      };
      setGuestCodes((prev) => {
        const updated = [newCode, ...prev];
        persistGuests(updated);
        return updated;
      });
    },
    [persistGuests]
  );

  const deactivateGuestCode = useCallback(
    (id: string) => {
      setGuestCodes((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, isActive: false } : c
        );
        persistGuests(updated);
        return updated;
      });
    },
    [persistGuests]
  );

  const addReport = useCallback(
    (report: Omit<MaintenanceReport, "id" | "ticketNumber" | "createdAt" | "updatedAt">) => {
      const id = generateId();
      const newReport: MaintenanceReport = {
        ...report,
        id,
        ticketNumber: generateTicket(id),
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setReports((prev) => {
        const updated = [newReport, ...prev];
        persistReports(updated);
        return updated;
      });
    },
    [persistReports]
  );

  const addGateActivity = useCallback(
    (activity: Omit<GateActivity, "id">) => {
      const newActivity: GateActivity = {
        ...activity,
        id: generateId(),
      };
      setGateActivity((prev) => {
        const updated = [newActivity, ...prev].slice(0, 50);
        persistGate(updated);
        return updated;
      });
    },
    [persistGate]
  );

  return (
    <AppContext.Provider
      value={{
        profile: defaultProfile,
        guestCodes,
        reports,
        gateActivity,
        addGuestCode,
        deactivateGuestCode,
        addReport,
        addGateActivity,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
