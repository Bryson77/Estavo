import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { StatusBadge } from "./StatusBadge";
import type { MaintenanceReport } from "@/context/AppContext";

interface ReportCardProps {
  report: MaintenanceReport;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};

const CATEGORY_ICONS: Record<string, string> = {
  maintenance: "construct-outline",
  security: "shield-outline",
  urgent: "alert-circle-outline",
  general: "information-circle-outline",
};

export function ReportCard({ report }: ReportCardProps) {
  const colors = useColors();
  const priorityColor = PRIORITY_COLORS[report.priority];
  const iconName = CATEGORY_ICONS[report.category] as any;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: priorityColor,
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: colors.muted },
          ]}
        >
          <Ionicons name={iconName} size={18} color={priorityColor} />
        </View>
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {report.title}
          </Text>
          <Text
            style={[styles.ticket, { color: colors.mutedForeground }]}
          >
            {report.ticketNumber}
          </Text>
        </View>
        <StatusBadge status={report.status} small />
      </View>
      <View style={[styles.footer, { borderColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          {timeAgo(report.createdAt)}
        </Text>
        <View style={styles.priorityDot}>
          <View
            style={[
              styles.dot,
              { backgroundColor: priorityColor },
            ]}
          />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} priority
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    paddingBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  ticket: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  priorityDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
