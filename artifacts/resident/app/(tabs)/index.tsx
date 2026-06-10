import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

function StatCard({
  label,
  value,
  sub,
  iconName,
}: {
  label: string;
  value: string | number;
  sub?: string;
  iconName: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.statHeader}>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Ionicons name={iconName as any} size={16} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      {sub ? (
        <Text style={[styles.statSub, { color: colors.mutedForeground }]}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

function InlineHoldButton({
  onComplete,
  color,
}: {
  onComplete: () => void;
  color: string;
}) {
  const [isHolding, setIsHolding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const completedRef = useRef(false);

  const startHold = useCallback(() => {
    if (completedRef.current) return;
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete();
        setTimeout(() => {
          completedRef.current = false;
          setCompleted(false);
          progress.setValue(0);
        }, 2000);
      }
    });
  }, [onComplete, progress]);

  const stopHold = useCallback(() => {
    if (completedRef.current) return;
    setIsHolding(false);
    animRef.current?.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => () => { animRef.current?.stop(); }, []);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <TouchableWithoutFeedback onPressIn={startHold} onPressOut={stopHold}>
      <View
        style={[
          styles.holdRow,
          { backgroundColor: "rgba(255,255,255,0.15)" },
        ]}
      >
        {/* progress fill */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.15)",
              width: fillWidth as any,
            },
          ]}
        />
        <Text style={styles.holdText}>
          {completed ? "Gate opening…" : isHolding ? "Holding…" : "Hold to open"}
        </Text>
        <Ionicons
          name={completed ? "checkmark" : "chevron-forward"}
          size={16}
          color="#FFFFFF"
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, guestCodes, reports, addGateActivity } = useApp();

  const activeCodes = guestCodes.filter(
    (g) => g.isActive && new Date(g.validUntil).getTime() > Date.now()
  ).length;
  const guestsInside = guestCodes.filter(
    (g) => g.isActive && !g.isParcel && new Date(g.validUntil).getTime() > Date.now()
  ).length;
  const openTickets = reports.filter((r) =>
    ["open", "in_progress"].includes(r.status)
  ).length;

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 90;

  const handleGateOpen = () => {
    addGateActivity({
      gateLabel: "Main Gate",
      direction: "entry",
      triggeredAt: new Date().toISOString(),
      status: "success",
    });
  };

  const handleEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Emergency Alert",
      "Hold for 5 seconds to alert security. This will notify all security personnel immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Alert Security",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Alert Sent", "Security has been notified.", [{ text: "OK" }]);
          },
        },
      ]
    );
  };

  const initials = profile.avatarInitials;
  const firstName = profile.firstName;
  const estateName = profile.estateName;
  const unit = profile.unitNumber;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Blue Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: topPad + 12 },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerSub}>
              RESIDENT · {profile.firstName.toUpperCase()} {profile.lastName.toUpperCase().charAt(0)}.
            </Text>
            <Text style={styles.headerTitle}>{estateName}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {}}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Unit subtitle */}
        <View style={styles.unitRow}>
          <Text style={[styles.unitText, { color: colors.mutedForeground }]}>
            Unit {unit} · {estateName}
          </Text>
        </View>

        {/* Greeting */}
        <View style={styles.greetRow}>
          <View>
            <Text style={[styles.greetLabel, { color: colors.mutedForeground }]}>
              {getGreeting().toUpperCase()}
            </Text>
            <Text style={[styles.greetName, { color: colors.foreground }]}>
              {firstName}
            </Text>
          </View>
          <Pressable
            style={[styles.bellBtn, { borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* 2×2 stat grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="ACTIVE CODES"
              value={activeCodes}
              iconName="key-outline"
            />
            <StatCard
              label="GUESTS INSIDE"
              value={guestsInside}
              iconName="person-outline"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="WEATHER"
              value="24°"
              sub="Partly cloudy"
              iconName="partly-sunny-outline"
            />
            <StatCard
              label="OPEN TICKETS"
              value={openTickets}
              iconName="build-outline"
            />
          </View>
        </View>

        {/* Main Gate card */}
        <View style={[styles.gateCard, { backgroundColor: colors.primary }]}>
          <View style={styles.gateCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.gateCardLabel}>MAIN GATE</Text>
              <Text style={styles.gateCardTitle}>All gates online</Text>
              <View style={styles.gateStatusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.gateStatusText}>Online</Text>
              </View>
            </View>
            <View style={styles.gateIconCircle}>
              <Ionicons name="business-outline" size={22} color="#FFFFFF" />
            </View>
          </View>
          <InlineHoldButton onComplete={handleGateOpen} color={colors.primary} />
        </View>

        {/* Management updates */}
        <Pressable
          onPress={() => router.push("/(tabs)/community")}
          style={({ pressed }) => [
            styles.updatesCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={[styles.updatesIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.updatesLabel, { color: colors.mutedForeground }]}>
              MANAGEMENT UPDATES
            </Text>
            <Text style={[styles.updatesBody, { color: colors.foreground }]}>
              3 unread notices
            </Text>
          </View>
          <View style={[styles.badgeCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>3</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </Pressable>

        {/* Emergency */}
        <Pressable
          onPress={handleEmergency}
          style={({ pressed }) => [
            styles.emergencyCard,
            {
              backgroundColor: pressed ? "#7B1111" : (colors.emergency ?? "#8B1C1C"),
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyLabel}>EMERGENCY</Text>
            <Text style={styles.emergencySub}>Hold 5 seconds to alert security</Text>
          </View>
          <View style={[styles.emergencyIconCircle, { borderColor: "rgba(255,255,255,0.4)" }]}>
            <Ionicons name="alarm-outline" size={22} color="#FFFFFF" />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  headerInfo: { flex: 1 },
  headerSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 1,
  },

  unitRow: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
  },
  unitText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },

  greetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 18,
  },
  greetLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
  },
  greetName: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statsGrid: {
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
  statSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: -4,
  },

  gateCard: {
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  gateCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  gateCardLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  gateCardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  gateStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  gateStatusText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  gateIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  holdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    overflow: "hidden",
  },
  holdText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },

  updatesCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  updatesIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  updatesLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  updatesBody: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  badgeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#FFFFFF",
  },

  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    borderRadius: 14,
    padding: 18,
    gap: 12,
    marginBottom: 8,
  },
  emergencyLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 3,
  },
  emergencySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  emergencyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
