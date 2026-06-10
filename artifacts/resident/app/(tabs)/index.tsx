import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { ReportCard } from "@/components/ReportCard";

function QuickStatCard({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
          flex: 1,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, guestCodes, reports, gateActivity } = useApp();
  const [emergencyPressed, setEmergencyPressed] = useState(false);

  const activeGuests = guestCodes.filter(
    (g) => g.isActive && new Date(g.validUntil).getTime() > Date.now()
  ).length;
  const openReports = reports.filter((r) =>
    ["open", "in_progress"].includes(r.status)
  ).length;
  const lastGate = gateActivity[0];

  const handleEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Emergency Alert",
      "This will alert all security personnel at your estate immediately. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Alert",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              "Alert Sent",
              "Security has been notified. They will respond shortly.",
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greetingLabel, { color: colors.mutedForeground }]}>
            Good {getTimeOfDay()}
          </Text>
          <Text style={[styles.greetingName, { color: colors.foreground }]}>
            {profile.firstName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.navyMid ?? "#1A2840" },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {profile.avatarInitials}
            </Text>
          </View>
        </View>
      </View>

      {/* Estate card */}
      <View
        style={[
          styles.estateCard,
          {
            backgroundColor: colors.navy,
          },
        ]}
      >
        <View style={styles.estateTop}>
          <View>
            <Text style={[styles.estateName, { color: "#FFFFFF" }]}>
              {profile.estateName}
            </Text>
            <Text style={[styles.estateUnit, { color: "#FFFFFF99" }]}>
              Unit {profile.unitNumber} · {profile.estateAddress.split(",")[1]?.trim()}
            </Text>
          </View>
          <StatusBadge status={profile.accountStanding} small />
        </View>
        <View style={[styles.estateBottom, { borderTopColor: "#FFFFFF18" }]}>
          <Ionicons name="location-outline" size={12} color="#FFFFFF66" />
          <Text style={[styles.estateAddress, { color: "#FFFFFF66" }]}>
            {profile.estateAddress}
          </Text>
        </View>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <QuickStatCard
          icon="people-outline"
          label="Active Guests"
          value={activeGuests}
          color={colors.teal}
          onPress={() => router.push("/(tabs)/guests")}
        />
        <QuickStatCard
          icon="construct-outline"
          label="Open Tickets"
          value={openReports}
          color={colors.amber}
          onPress={() => router.push("/(tabs)/reports")}
        />
        <QuickStatCard
          icon="car-outline"
          label="Gate Today"
          value={gateActivity.filter((g) => {
            const d = new Date(g.triggeredAt);
            const today = new Date();
            return d.toDateString() === today.toDateString();
          }).length}
          color={colors.success}
          onPress={() => router.push("/(tabs)/gate")}
        />
      </View>

      {/* Emergency */}
      <Pressable
        onPress={handleEmergency}
        style={({ pressed }) => [
          styles.emergencyBtn,
          {
            backgroundColor: pressed ? "#991B1B" : "#EF4444",
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Ionicons name="warning-outline" size={20} color="#FFFFFF" />
        <Text style={styles.emergencyText}>Emergency Alert</Text>
      </Pressable>

      {/* Recent activity */}
      {lastGate && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Last Gate Activity
          </Text>
          <View
            style={[
              styles.activityRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: colors.secondary },
              ]}
            >
              <MaterialCommunityIcons
                name={lastGate.direction === "entry" ? "gate-arrow-right" : "gate"}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.activityLabel, { color: colors.foreground }]}>
                {lastGate.gateLabel}
              </Text>
              <Text
                style={[styles.activityTime, { color: colors.mutedForeground }]}
              >
                {lastGate.direction === "entry" ? "Entry" : "Exit"} ·{" "}
                {formatTime(lastGate.triggeredAt)}
              </Text>
            </View>
            <StatusBadge status={lastGate.status} small />
          </View>
        </View>
      )}

      {/* Recent reports */}
      {reports.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent Reports
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/reports")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </Pressable>
          </View>
          {reports.slice(0, 2).map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginBottom: 2,
  },
  greetingName: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  estateCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  estateTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  estateName: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    marginBottom: 3,
  },
  estateUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  estateBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  estateAddress: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
    gap: 6,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    lineHeight: 14,
  },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 24,
  },
  emergencyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 12,
  },
  seeAll: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  activityTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
});
