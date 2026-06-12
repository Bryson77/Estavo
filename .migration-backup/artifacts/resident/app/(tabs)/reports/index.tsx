import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, type MaintenanceReport, type Contractor } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

// ─── Status helpers ─────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  open: "#EF4444",
  in_progress: "#F59E0B",
  resolved: "#22C55E",
  closed: "#6B7280",
};
const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

// ─── Report card ─────────────────────────────────────────────────────────────

function ReportCard({ report }: { report: MaintenanceReport }) {
  const colors = useColors();
  const sc = STATUS_COLOR[report.status] ?? colors.mutedForeground;
  const sl = STATUS_LABEL[report.status] ?? report.status;

  return (
    <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.reportTop}>
        <Text style={[styles.reportTicket, { color: colors.mutedForeground }]}>
          #{report.ticketNumber ?? report.id.slice(0, 4).toUpperCase()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: sc + "22" }]}>
          <Text style={[styles.statusText, { color: sc }]}>{sl}</Text>
        </View>
      </View>
      <Text style={[styles.reportTitle, { color: colors.foreground }]}>{report.title}</Text>
      <Text style={[styles.reportPriority, { color: colors.mutedForeground }]}>
        Priority · {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
      </Text>
    </View>
  );
}

// ─── Contractor card ─────────────────────────────────────────────────────────

function ContractorCard({ contractor }: { contractor: Contractor }) {
  const colors = useColors();

  const initials = contractor.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const trade =
    contractor.tradeCategories?.length ? contractor.tradeCategories[0] : "General";

  const handleCall = () => {
    if (contractor.phone) Linking.openURL(`tel:${contractor.phone}`);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };
  const handleWhatsApp = () => {
    const num = (contractor.whatsapp ?? contractor.phone ?? "").replace(/\D/g, "");
    if (num) Linking.openURL(`https://wa.me/${num}`);
  };

  return (
    <View style={[styles.contractorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Avatar row */}
      <View style={styles.contractorTop}>
        <View style={[styles.contractorAvatar, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.contractorInitials, { color: colors.primary }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.contractorNameRow}>
            <Text style={[styles.contractorName, { color: colors.foreground }]} numberOfLines={1}>
              {contractor.name}
            </Text>
            {contractor.isVerified && (
              <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
            )}
          </View>
          {contractor.description ? (
            <Text style={[styles.contractorCompany, { color: colors.mutedForeground }]} numberOfLines={1}>
              {contractor.description}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Trade + stats */}
      <View style={styles.contractorStats}>
        <View style={[styles.tradePill, { backgroundColor: colors.muted }]}>
          <Ionicons name="construct-outline" size={11} color={colors.mutedForeground} />
          <Text style={[styles.tradeText, { color: colors.mutedForeground }]}>{trade}</Text>
        </View>
        {contractor.rating != null && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>{contractor.rating.toFixed(1)}</Text>
          </View>
        )}
        {contractor.jobCount != null && (
          <Text style={[styles.jobCount, { color: colors.mutedForeground }]}>
            {contractor.jobCount} jobs
          </Text>
        )}
        {contractor.avgResponseMins != null && (
          <Text style={[styles.jobCount, { color: colors.mutedForeground }]}>
            ~{contractor.avgResponseMins < 60 ? `${contractor.avgResponseMins} min` : `${Math.round(contractor.avgResponseMins / 60)}h`}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.contractorActions}>
        <Pressable
          style={({ pressed }) => [styles.callBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
          onPress={handleCall}
        >
          <Ionicons name="call-outline" size={14} color="#FFFFFF" />
          <Text style={styles.callBtnText}>Call</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.waBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1, backgroundColor: colors.card }]}
          onPress={handleWhatsApp}
        >
          <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
          <Text style={[styles.waBtnText, { color: colors.foreground }]}>WhatsApp</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type Filter = "all" | "open" | "in_progress" | "resolved" | "closed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { reports, reportStats, contractors, isLoading, refreshReports } = useApp();

  const [filter, setFilter] = useState<Filter>("all");
  const [archivedOpen, setArchivedOpen] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const subLabel = user
    ? `RESIDENT · ${user.firstName?.toUpperCase()} ${user.lastName?.[0]?.toUpperCase()}.`
    : "RESIDENT";

  const activeReports = reports.filter((r) => r.status !== "closed");
  const closedReports = reports.filter((r) => r.status === "closed");

  const filtered =
    filter === "all"
      ? activeReports
      : activeReports.filter((r) => r.status === filter);

  if (isLoading && reports.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Reports" subtitle={subLabel} showAvatar initials={initials} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Reports" subtitle={subLabel} showAvatar initials={initials} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* ── Stats row ── */}
        <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: "#EF4444" }]}>{reportStats.open}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>OPEN</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: "#F59E0B" }]}>{reportStats.inProgress}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>IN PROGRESS</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: "#22C55E" }]}>{reportStats.resolved}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>RESOLVED</Text>
          </View>
        </View>

        {/* ── Filter chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.foreground : colors.card,
                    borderColor: active ? colors.foreground : colors.border,
                  },
                ]}
                onPress={() => { setFilter(f.key); Haptics.selectionAsync(); }}
              >
                <Text style={{ color: active ? colors.background : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Report cards ── */}
        <View style={{ paddingHorizontal: 14, gap: 8, marginTop: 4 }}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {filter === "all" ? "No active reports. Tap + to log an issue." : `No ${STATUS_LABEL[filter] ?? filter} reports.`}
              </Text>
            </View>
          ) : (
            filtered.map((r) => <ReportCard key={r.id} report={r} />)
          )}
        </View>

        {/* ── Trusted Contractors ── */}
        {contractors.length > 0 && (
          <View style={styles.contractorsSection}>
            <View style={styles.contractorsHeader}>
              <View>
                <Text style={[styles.contractorsSectionTitle, { color: colors.foreground }]}>
                  TRUSTED CONTRACTORS
                </Text>
                <Text style={[styles.contractorsSectionSub, { color: colors.mutedForeground }]}>
                  Vetted by estate management
                </Text>
              </View>
              <View style={[styles.verifiedBadge, { borderColor: colors.primary }]}>
                <Ionicons name="checkmark-circle-outline" size={12} color={colors.primary} />
                <Text style={[styles.verifiedText, { color: colors.primary }]}>Verified</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contractorScroll}
            >
              {contractors.map((c) => <ContractorCard key={c.id} contractor={c} />)}
            </ScrollView>
          </View>
        )}

        {/* ── Closed & Archived ── */}
        {closedReports.length > 0 && (
          <Pressable
            style={[styles.archivedHeader, { borderTopColor: colors.border }]}
            onPress={() => { setArchivedOpen((v) => !v); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.archivedTitle, { color: colors.mutedForeground }]}>
              CLOSED & ARCHIVED · {closedReports.length}
            </Text>
            <Ionicons
              name={archivedOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>
        )}
        {archivedOpen && (
          <View style={{ paddingHorizontal: 14, gap: 8, marginTop: 4 }}>
            {closedReports.map((r) => <ReportCard key={r.id} report={r} />)}
          </View>
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push("/(tabs)/reports/new" as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingVertical: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  statCell: { flex: 1, alignItems: "center" },
  statNum: { fontFamily: "Inter_700Bold", fontSize: 26 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, height: 36, alignSelf: "center" },

  // Filters
  filterRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },

  // Report card
  reportCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  reportTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reportTicket: { fontFamily: "Inter_500Medium", fontSize: 12 },
  reportTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  reportPriority: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },

  // Contractors
  contractorsSection: { marginTop: 20 },
  contractorsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  contractorsSectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  contractorsSectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  verifiedText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  contractorScroll: { paddingHorizontal: 14, gap: 10 },
  contractorCard: {
    width: 230,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  contractorTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  contractorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contractorInitials: { fontFamily: "Inter_700Bold", fontSize: 15 },
  contractorNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  contractorName: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 },
  contractorCompany: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  contractorStats: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  tradePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tradeText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  jobCount: { fontFamily: "Inter_400Regular", fontSize: 11 },
  contractorActions: { flexDirection: "row", gap: 8 },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  callBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF" },
  waBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  waBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  // Closed & Archived
  archivedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 16,
    borderTopWidth: 1,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  archivedTitle: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.6 },

  // Empty
  empty: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20 },

  // FAB
  fab: {
    position: "absolute",
    bottom: 96,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
