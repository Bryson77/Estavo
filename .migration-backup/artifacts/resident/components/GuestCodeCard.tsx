import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { StatusBadge } from "./StatusBadge";
import type { GuestCode } from "@/context/AppContext";

interface GuestCodeCardProps {
  code: GuestCode;
  onDeactivate: (id: string) => void;
}

function timeUntilExpiry(validUntil: string): string {
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export function GuestCodeCard({ code, onDeactivate }: GuestCodeCardProps) {
  const colors = useColors();
  const [pinVisible, setPinVisible] = useState(false);
  const isExpired = new Date(code.validUntil).getTime() <= Date.now();
  const isActive = code.isActive && !isExpired;

  const handleDeactivate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Deactivate Code",
      `Remove access for ${code.guestFirstName} ${code.guestLastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => onDeactivate(code.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: isActive ? 1 : 0.6,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: code.isParcel
                  ? "#FEF3C7"
                  : colors.secondary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={code.isParcel ? "package-variant" : "account"}
              size={18}
              color={code.isParcel ? "#D97706" : colors.primary}
            />
          </View>
          <View>
            <Text
              style={[styles.guestName, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {code.isParcel
                ? "Parcel Delivery"
                : `${code.guestFirstName} ${code.guestLastName}`}
            </Text>
            {code.guestPhone ? (
              <Text
                style={[styles.guestPhone, { color: colors.mutedForeground }]}
              >
                {code.guestPhone}
              </Text>
            ) : null}
          </View>
        </View>
        <StatusBadge
          status={isActive ? "active" : "expired"}
          small
        />
      </View>

      <View style={[styles.pinRow, { borderColor: colors.border }]}>
        <View style={styles.pinLeft}>
          <Text style={[styles.pinLabel, { color: colors.mutedForeground }]}>
            PIN CODE
          </Text>
          <Text
            style={[
              styles.pin,
              {
                color: isActive ? colors.primary : colors.mutedForeground,
                fontFamily: "Inter_700Bold",
                letterSpacing: pinVisible ? 6 : 2,
              },
            ]}
          >
            {pinVisible ? code.pinCode : "••••••"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            setPinVisible((v) => !v);
          }}
          style={styles.revealBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={pinVisible ? "eye-off-outline" : "eye-outline"}
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {isActive ? timeUntilExpiry(code.validUntil) : "Expired"}
          </Text>
          <Text style={[styles.footerSep, { color: colors.border }]}>·</Text>
          <Ionicons name="enter-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {code.usesRemaining}/{code.usesTotal} uses
          </Text>
        </View>
        {isActive && (
          <TouchableOpacity onPress={handleDeactivate} activeOpacity={0.7}>
            <Ionicons name="close-circle-outline" size={20} color={colors.destructive} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  guestName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  guestPhone: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  pinLeft: {
    gap: 2,
  },
  pinLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  pin: {
    fontSize: 22,
  },
  revealBtn: {
    padding: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingHorizontal: 14,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  footerSep: {
    fontSize: 14,
    marginHorizontal: 2,
  },
});
