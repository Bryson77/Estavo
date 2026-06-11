import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

function StatusBadge({ active }: { active: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.badge, { backgroundColor: active ? colors.success + "22" : colors.muted }]}>
      <Text style={[styles.badgeText, { color: active ? colors.success : colors.mutedForeground }]}>
        {active ? "Active" : "Expired"}
      </Text>
    </View>
  );
}

export default function GuestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { guestCodes, guestStats, isLoading, deactivateGuestCode, refreshGuests } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGuests();
    setRefreshing(false);
  };

  const handleDeactivate = (id: string, name: string) => {
    Alert.alert(
      "Deactivate Code",
      `Remove access for ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await deactivateGuestCode(id);
            } catch {
              Alert.alert("Error", "Could not deactivate guest code.");
            }
          },
        },
      ]
    );
  };

  const activeCodes = guestCodes.filter(c => c.isActive);
  const inactiveCodes = guestCodes.filter(c => !c.isActive);

  if (isLoading && guestCodes.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Guest Access</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/guests/new")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>New Code</Text>
        </Pressable>
      </View>

      <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{guestStats.activeCodes}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Active</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>{guestStats.insideNow}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Inside Now</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.mutedForeground }]}>{guestStats.maxActive}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Max Codes</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeCodes.length === 0 && inactiveCodes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No guest codes yet. Tap "New Code" to create one.
            </Text>
          </View>
        ) : null}

        {activeCodes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACTIVE CODES</Text>
            {activeCodes.map(code => (
              <Pressable
                key={code.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: "/(tabs)/guests/[id]", params: { id: code.id } })}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardIcon}>
                    <Ionicons name={code.isParcel ? "cube-outline" : "person-outline"} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: colors.foreground }]}>
                      {code.isParcel ? "Parcel Delivery" : `${code.guestFirstName} ${code.guestLastName}`}
                    </Text>
                    <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                      PIN: {code.pinCode} · {code.usesRemaining}/{code.usesTotal} uses left
                    </Text>
                  </View>
                  <View style={styles.cardRight}>
                    <StatusBadge active={true} />
                    <Pressable
                      style={styles.revokeBtn}
                      onPress={() => handleDeactivate(code.id, code.guestFirstName)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {inactiveCodes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>EXPIRED / USED</Text>
            {inactiveCodes.slice(0, 10).map(code => (
              <View
                key={code.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardIcon}>
                    <Ionicons name={code.isParcel ? "cube-outline" : "person-outline"} size={20} color={colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: colors.foreground }]}>
                      {code.isParcel ? "Parcel Delivery" : `${code.guestFirstName} ${code.guestLastName}`}
                    </Text>
                    <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                      PIN: {code.pinCode} · {code.usesRemaining}/{code.usesTotal} uses
                    </Text>
                  </View>
                  <StatusBadge active={false} />
                </View>
              </View>
            ))}
          </View>
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
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, marginBottom: 10 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 14,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(99,102,241,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 15, fontWeight: "600" },
  cardSub: { fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: "flex-end", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  revokeBtn: { padding: 4 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
});
