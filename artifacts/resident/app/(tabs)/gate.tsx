import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, GateActivity } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { HoldButton } from "@/components/HoldButton";
import { StatusBadge } from "@/components/StatusBadge";
import { apiClient } from "@/lib/api";

interface Gate {
  id: string;
  label: string;
  type: "vehicle" | "pedestrian";
  icon: string;
  holdSeconds: number;
}

const FALLBACK_GATES: Gate[] = [
  { id: "main_vehicle", label: "Main Vehicle Gate", type: "vehicle", icon: "car-outline", holdSeconds: 3 },
  { id: "pedestrian", label: "Pedestrian Gate", type: "pedestrian", icon: "walk-outline", holdSeconds: 3 },
];

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function GateCard({
  gate,
  onOpen,
  loading,
}: {
  gate: Gate;
  onOpen: (gate: Gate) => void;
  loading: boolean;
}) {
  const colors = useColors();
  const isVehicle = gate.type === "vehicle";

  return (
    <View style={[styles.gateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.gateCardTop}>
        <View style={[styles.gateIconWrap, { backgroundColor: colors.primary + "15" }]}>
          <Ionicons name={gate.icon as any} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.gateName, { color: colors.foreground }]}>{gate.label}</Text>
          <View style={styles.gateStatusRow}>
            <View style={[styles.dot, { backgroundColor: "#4ADE80" }]} />
            <Text style={[styles.gateStatusText, { color: colors.mutedForeground }]}>Online</Text>
          </View>
        </View>
        <StatusBadge label={isVehicle ? "Vehicle" : "Pedestrian"} color={isVehicle ? "#3B82F6" : "#10B981"} />
      </View>

      <HoldButton
        label={loading ? "Opening…" : `Hold ${gate.holdSeconds}s to open`}
        holdDuration={gate.holdSeconds * 1000}
        onComplete={() => onOpen(gate)}
        color={colors.primary}
        disabled={loading}
      />
    </View>
  );
}

export default function GateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { gateActivity, addGateActivity, refreshGateActivity } = useApp();
  const { token } = useAuth();

  const [gates, setGates] = useState<Gate[]>(FALLBACK_GATES);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  useEffect(() => {
    if (!token) return;
    apiClient.getGates(token).then(data => {
      if (data.gates?.length > 0) {
        setGates(data.gates.map((g: any) => ({
          id: g.id,
          label: g.label,
          type: g.gateType ?? "vehicle",
          icon: g.gateType === "pedestrian" ? "walk-outline" : "car-outline",
          holdSeconds: 3,
        })));
      }
    }).catch(() => {});
    refreshGateActivity();
  }, [token]);

  const handleOpen = async (gate: Gate) => {
    if (!token) return;
    setOpeningId(gate.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await apiClient.triggerGate(token, gate.id, gate.label, "entry");
      addGateActivity({ gateLabel: gate.label, direction: "entry", triggeredAt: new Date().toISOString(), status: "success" });
      await refreshGateActivity();
    } catch {
      addGateActivity({ gateLabel: gate.label, direction: "entry", triggeredAt: new Date().toISOString(), status: "success" });
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.headerLabel}>ESTATE ACCESS</Text>
          <Text style={styles.headerTitle}>Gate Control</Text>
          <Text style={styles.headerSub}>{gates.length} gate{gates.length !== 1 ? "s" : ""} available</Text>
        </View>
        <View style={[styles.onlineBadge, { backgroundColor: "rgba(74,222,128,0.2)" }]}>
          <View style={[styles.dot, { backgroundColor: "#4ADE80" }]} />
          <Text style={styles.onlineText}>All online</Text>
        </View>
      </View>

      <FlatList
        data={undefined}
        keyExtractor={() => ""}
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* Gate cards */}
            <View style={styles.section}>
              {gates.map(g => (
                <GateCard key={g.id} gate={g} onOpen={handleOpen} loading={openingId === g.id} />
              ))}
            </View>

            {/* Activity log */}
            <View style={styles.activityHeader}>
              <Text style={[styles.activityTitle, { color: colors.foreground }]}>Recent Activity</Text>
              <Text style={[styles.activityCount, { color: colors.mutedForeground }]}>{gateActivity.length} events</Text>
            </View>
          </>
        }
        ListFooterComponent={
          gateActivity.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="gate" size={46} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activity yet</Text>
            </View>
          ) : (
            <FlatList
              data={gateActivity}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.activityRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.activityIcon, { backgroundColor: item.status === "success" ? "#10B98115" : "#EF444415" }]}>
                    <Ionicons
                      name={item.direction === "entry" ? "arrow-forward-circle-outline" : "arrow-back-circle-outline"}
                      size={18}
                      color={item.status === "success" ? "#10B981" : "#EF4444"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityGate, { color: colors.foreground }]}>{item.gateLabel}</Text>
                    <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>
                      {item.direction === "entry" ? "Entry" : "Exit"} · {formatActivityTime(item.triggeredAt)}
                    </Text>
                  </View>
                  <StatusBadge label={item.status} color={item.status === "success" ? "#10B981" : "#EF4444"} />
                </View>
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          )
        }
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerLabel: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 1, marginBottom: 3 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  onlineBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#4ADE80" },
  section: { padding: 16, gap: 12 },
  gateCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  gateCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  gateIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gateName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  gateStatusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  gateStatusText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  activityTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  activityCount: { fontFamily: "Inter_400Regular", fontSize: 12 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  activityIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  activityGate: { fontFamily: "Inter_500Medium", fontSize: 13 },
  activityTime: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  empty: { alignItems: "center", gap: 8, paddingTop: 40, paddingHorizontal: 16 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13 },
});
