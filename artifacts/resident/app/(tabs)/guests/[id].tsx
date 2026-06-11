import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function GuestDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { guestCodes } = useApp();

  const code = guestCodes.find(c => c.id === id);

  if (!code) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Code not found.</Text>
      </View>
    );
  }

  const validUntil = new Date(code.validUntil);
  const isExpired = validUntil < new Date() || !code.isActive;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          <Text style={[styles.backLabel, { color: colors.foreground }]}>Back</Text>
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>
          {code.isParcel ? "Parcel Code" : `${code.guestFirstName}'s Code`}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, alignItems: "center" }}>
        <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: isExpired ? 0.5 : 1 }]}>
          {isExpired ? (
            <View style={styles.expiredOverlay}>
              <Ionicons name="lock-closed" size={40} color={colors.mutedForeground} />
              <Text style={[styles.expiredText, { color: colors.mutedForeground }]}>Code Expired</Text>
            </View>
          ) : (
            <QRCode value={code.qrPayload || code.pinCode} size={200} color={colors.foreground} backgroundColor="transparent" />
          )}
        </View>

        <View style={[styles.pinBox, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
          <Text style={[styles.pinLabel, { color: colors.mutedForeground }]}>PIN CODE</Text>
          <Text style={[styles.pinValue, { color: colors.primary }]}>{code.pinCode}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="Guest" value={code.isParcel ? "Parcel Delivery" : `${code.guestFirstName} ${code.guestLastName}`} colors={colors} />
          {code.guestPhone ? <InfoRow label="Phone" value={code.guestPhone} colors={colors} /> : null}
          <InfoRow label="Uses Remaining" value={`${code.usesRemaining} / ${code.usesTotal}`} colors={colors} />
          <InfoRow label="Valid Until" value={validUntil.toLocaleString()} colors={colors} />
          <InfoRow label="Status" value={isExpired ? "Expired" : "Active"} valueColor={isExpired ? colors.mutedForeground : colors.success} colors={colors} />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, colors, valueColor }: { label: string; value: string; colors: any; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, width: 60 },
  backLabel: { fontSize: 16 },
  topTitle: { fontSize: 17, fontWeight: "600" },
  qrCard: {
    width: 240,
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 16,
  },
  expiredOverlay: { alignItems: "center", gap: 8 },
  expiredText: { fontSize: 16, fontWeight: "600" },
  pinBox: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 20,
  },
  pinLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8 },
  pinValue: { fontSize: 36, fontWeight: "800", letterSpacing: 6, marginTop: 4 },
  infoCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "600" },
});
