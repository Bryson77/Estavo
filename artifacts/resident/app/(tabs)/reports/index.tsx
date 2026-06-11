import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, type MaintenanceReport } from "@/context/AppContext";

const STATUS_COLORS: Record<string, string> = {
  open: "#ef4444",
  in_progress: "#f59e0b",
  resolved: "#22c55e",
  closed: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const CATEGORY_ICONS: Record<string, string> = {
  maintenance: "construct-outline",
  security: "shield-outline",
  urgent: "warning-outline",
  general: "chatbubble-outline",
};

function ReportCard({ report, onPress }: { report: MaintenanceReport; onPress: () => void }) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[report.status] ?? colors.mutedForeground;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: statusColor + "18" }]}>
          <Ionicons name={(CATEGORY_ICONS[report.category] ?? "document-outline") as any} size={18} color={statusColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>{report.title}</Text>
          <Text style={[styles.cardTicket, { color: colors.mutedForeground }]}>{report.ticketNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[report.status] ?? report.status}</Text>
        </View>
      </View>
      <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
        {report.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>
          {new Date(report.createdAt).toLocaleDateString()}
        </Text>
        <View style={[styles.priorityChip, { backgroundColor: report.priority === "high" ? "#ef444422" : colors.muted }]}>
          <Text style={[styles.priorityText, { color: report.priority === "high" ? "#ef4444" : colors.mutedForeground }]}>
            {report.priority}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports, reportStats, isLoading, refreshReports } = useApp();
  const [filter, setFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshReports();
    setRefreshing(false);
  };

  const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter);

  if (isLoading && reports.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Reports</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/reports/new")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>New Report</Text>
        </Pressable>
      </View>

      <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: "#ef4444" }]}>{reportStats.open}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Open</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: "#f59e0b" }]}>{reportStats.inProgress}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>In Progress</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: "#22c55e" }]}>{reportStats.resolved}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Resolved</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {[
          { key: "all", label: "All" },
          { key: "open", label: "Open" },
          { key: "in_progress", label: "In Progress" },
          { key: "resolved", label: "Resolved" },
        ].map(f => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, {
              backgroundColor: filter === f.key ? colors.primary : colors.card,
              borderColor: filter === f.key ? colors.primary : colors.border,
            }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={{ color: filter === f.key ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === "all" ? "No reports yet. Tap 'New Report' to log an issue." : `No ${filter.replace("_", " ")} reports.`}
            </Text>
          </View>
        ) : (
          filtered.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => {}}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 32, alignSelf: "center" },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  iconBox: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardTicket: { fontSize: 11, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardDate: { fontSize: 12 },
  priorityChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  priorityText: { fontSize: 11, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
});
