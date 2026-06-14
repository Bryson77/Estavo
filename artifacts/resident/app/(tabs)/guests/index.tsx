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
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

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
  const { user } = useAuth();
  const { guestCodes, guestStats, isLoading, deactivateGuestCode, refreshGuests } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const initials = user?.firstName ? user.firstName[0].toUpperCase() : "?";
  const subLabel = user
    ? `UNIT ${user.unitNumber} · ${user.estateName?.toUpperCase()}`
    : "RESIDENT";
  const titleLabel = user ? `${user.firstName} ${user.lastName}` : "Estavo";

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Guest Access" subtitle={subLabel} showAvatar initials={initials} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Guest Access" subtitle={subLabel} showAvatar initials={initials} />

      <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{guestStats.activeCodes}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>ACTIVE</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>{guestStats.insideNow}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>INSIDE NOW</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.mutedForeground }]}>{guestStats.maxActive}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>MAX CODES</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeCodes.length === 0 && inactiveCodes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No guest codes yet. Tap "+" to create one.
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
                  <View style={[styles.cardIcon, { backgroundColor: colors.primary + "15" }]}>
                    <Ionicons name={code.isParcel ? "cube-outline" : "person-outline"} size={22} color={colors.primary} />
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
                      style={[styles.revokeBtn, { backgroundColor: colors.destructive + "15" }]}
                      onPress={() => handleDeactivate(code.id, code.guestFirstName)}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.destructive} />
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
                  <View style={[styles.cardIcon, { backgroundColor: colors.muted }]}>
                    <Ionicons name={code.isParcel ? "cube-outline" : "person-outline"} size={22} color={colors.mutedForeground} />
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

      {/* ── FAB ── */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push("/(tabs)/guests/new" as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontFamily: "Inter_700Bold", fontSize: 26 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, height: 36, alignSelf: "center" },
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.8, marginBottom: 10 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  cardSub: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 3 },
  cardRight: { alignItems: "flex-end", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  revokeBtn: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyText: { fontFamily: "Inter_400Regular", textAlign: "center", fontSize: 14, lineHeight: 20 },
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
