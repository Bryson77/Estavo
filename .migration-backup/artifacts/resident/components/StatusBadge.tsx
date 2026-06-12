import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type StatusType =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "active"
  | "expired"
  | "good"
  | "arrears"
  | "success"
  | "failed";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  small?: boolean;
}

export function StatusBadge({ status, label, small = false }: StatusBadgeProps) {
  const colors = useColors();

  const config: Record<StatusType, { bg: string; fg: string; text: string }> = {
    open: { bg: "#FEF3C7", fg: "#D97706", text: label ?? "Open" },
    in_progress: { bg: "#DBEAFE", fg: "#2563EB", text: label ?? "In Progress" },
    resolved: { bg: "#D1FAE5", fg: "#059669", text: label ?? "Resolved" },
    closed: { bg: colors.muted, fg: colors.mutedForeground, text: label ?? "Closed" },
    active: { bg: "#D1FAE5", fg: "#059669", text: label ?? "Active" },
    expired: { bg: colors.muted, fg: colors.mutedForeground, text: label ?? "Expired" },
    good: { bg: "#D1FAE5", fg: "#059669", text: label ?? "Good Standing" },
    arrears: { bg: "#FEE2E2", fg: "#DC2626", text: label ?? "Arrears" },
    success: { bg: "#D1FAE5", fg: "#059669", text: label ?? "Success" },
    failed: { bg: "#FEE2E2", fg: "#DC2626", text: label ?? "Failed" },
  };

  const { bg, fg, text } = config[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingHorizontal: small ? 6 : 8,
          paddingVertical: small ? 2 : 4,
          borderRadius: 6,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: fg,
            fontSize: small ? 10 : 11,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
