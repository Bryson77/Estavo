import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

export default function GuestDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { guestCodes, deactivateGuestCode } = useApp();
  const { user } = useAuth();

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

  const handleCopy = async () => {
    const greeting = code.isParcel ? "Hello!" : `Hi ${code.guestFirstName},`;
    const text = `${greeting} 👋
You've been invited to ${user?.estateName ?? "the estate"} by ${user?.firstName} ${user?.lastName} (Unit ${user?.unitNumber}).

We're looking forward to your arrival! Below is your secure entry code. Please present this to security or scan it at the gate when you arrive.

🔐 Your Access Code: ${code.pinCode}

📍 Location: https://maps.google.com/?q=${encodeURIComponent(user?.estateName ?? "")}
📅 Valid Until: ${validUntil.toLocaleDateString("en-ZA", {day: "numeric", month: "short", year: "numeric"})} at ${validUntil.toLocaleTimeString("en-ZA", {hour: "2-digit", minute: "2-digit", hour12: false})}
🎟️ Uses Remaining: ${code.usesRemaining}

Safe travels, and see you soon!
– Estavo`;
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Guest code message copied to clipboard.");
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate PIN",
      "Are you sure you want to permanently deactivate this PIN? The guest will no longer be able to enter.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Deactivate", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deactivateGuestCode(code.id);
              Alert.alert("Success", "PIN has been deactivated.");
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Could not deactivate PIN.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader 
        title={code.isParcel ? "Parcel Code" : `${code.guestFirstName}'s Code`} 
        showBack 
      />

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

        {!isExpired && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.copyBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={handleCopy}
            >
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={styles.copyBtnText}>Copy Code Message</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.deactivateBtn,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={handleDeactivate}
            >
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.deactivateBtnText}>Deactivate PIN</Text>
            </Pressable>
          </>
        )}

        {/* Activity Logs Section */}
        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: colors.foreground }]}>Activity Logs</Text>
          {code.usesTotal === code.usesRemaining ? (
            <View style={[styles.emptyHistory, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={32} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
              <Text style={{ color: colors.mutedForeground, textAlign: "center", fontFamily: "Inter_500Medium" }}>
                This code hasn't been used yet.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {Array.from({ length: code.usesTotal - code.usesRemaining }).map((_, i) => {
                // Mocking data: generating past entry/exit times
                const entryTime = new Date(new Date().getTime() - (i + 1) * 86400000 - Math.random() * 3600000);
                const isStillInside = i === 0 && Math.random() > 0.5; // Randomly make the most recent visit "still inside"
                const exitTime = isStillInside ? null : new Date(entryTime.getTime() + (Math.random() * 4 + 1) * 3600000);
                
                let durationStr = "Still inside";
                if (exitTime) {
                  const hours = Math.floor((exitTime.getTime() - entryTime.getTime()) / 3600000);
                  const minutes = Math.floor(((exitTime.getTime() - entryTime.getTime()) % 3600000) / 60000);
                  durationStr = `${hours}h ${minutes}m in estate`;
                }

                return (
                  <View key={i} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.logHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View style={[styles.logDot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.logGate, { color: colors.foreground }]}>Main Gate</Text>
                      </View>
                      <Text style={[styles.logDate, { color: colors.mutedForeground }]}>
                        {entryTime.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                    
                    <View style={styles.logBody}>
                      <View style={styles.logRow}>
                        <Ionicons name="log-in-outline" size={16} color={colors.success} />
                        <Text style={[styles.logText, { color: colors.mutedForeground }]}>
                          Entered at {entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={styles.logRow}>
                        {exitTime ? (
                          <>
                            <Ionicons name="log-out-outline" size={16} color="#F59E0B" />
                            <Text style={[styles.logText, { color: colors.mutedForeground }]}>
                              Exited at {exitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="ellipsis-horizontal-circle-outline" size={16} color={colors.primary} />
                            <Text style={[styles.logText, { color: colors.primary }]}>
                              Currently Inside
                            </Text>
                          </>
                        )}
                      </View>
                    </View>

                    <View style={[styles.logDuration, { backgroundColor: colors.background }]}>
                      <Ionicons name="timer-outline" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.logDurationText, { color: colors.foreground }]}>
                        {durationStr}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
  },
  copyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deactivateBtnText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  historySection: {
    width: "100%",
    marginTop: 32,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyHistory: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logGate: {
    fontSize: 14,
    fontWeight: "600",
  },
  logDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  logBody: {
    gap: 8,
    marginBottom: 16,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logText: {
    fontSize: 13,
    fontWeight: "500",
  },
  logDuration: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logDurationText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
