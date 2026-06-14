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
  View,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import ScreenHeader from "@/components/ScreenHeader";

function StatCard({
  label,
  value,
  sub,
  iconName,
  onPress,
}: {
  label: string;
  value: string | number;
  sub?: string;
  iconName: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  const content = (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.statHeader}>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Ionicons name={iconName as any} size={16} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      {sub ? <Text style={[styles.statSub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
    </View>
  );
  if (onPress) {
    return <Pressable onPress={onPress} style={{ flex: 1 }}>{content}</Pressable>;
  }
  return <View style={{ flex: 1 }}>{content}</View>;
}

function InlineHoldButton({ onComplete, color, label = "Hold to open" }: { onComplete: () => void; color: string; label?: string }) {
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
    Animated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: false }).start();
  }, [progress]);

  useEffect(() => () => { animRef.current?.stop(); }, []);

  const fillWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Pressable onPressIn={startHold} onPressOut={stopHold}>
      <View style={[styles.holdRow, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", width: fillWidth as any }]}
        />
        <Text style={styles.holdText}>
          {completed ? "Gate opening…" : isHolding ? "Holding…" : label}
        </Text>
        <Ionicons name={completed ? "checkmark" : "chevron-forward"} size={16} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { guestStats, reportStats, unreadBroadcasts, addGateActivity, triggerEmergency } = useApp();

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 90;

  const [gates, setGates] = useState<any[]>([]);
  const [openedGate, setOpenedGate] = useState<{ id: string; label: string; direction: string } | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(5);

  useEffect(() => {
    if (token) {
      apiClient.getGates(token)
        .then(data => {
          if (data.gates && data.gates.length > 0) {
            setGates(data.gates);
          } else {
            setGates([
              { id: 'gate-1', label: 'Gate Set 1 (Main)' },
              { id: 'gate-2', label: 'Gate Set 2 (North)' }
            ]);
          }
        })
        .catch(() => {
          setGates([
            { id: 'gate-1', label: 'Gate Set 1 (Main)' },
            { id: 'gate-2', label: 'Gate Set 2 (North)' }
          ]);
        });
    }
  }, [token]);

  const handleGateOpen = async (gateId: string, gateLabel: string, direction: "entry" | "exit") => {
    setOpenedGate({ id: gateId, label: gateLabel, direction });
    setUndoCountdown(5);
    if (token) {
      try {
        await apiClient.triggerGate(token, gateId, gateLabel, direction);
        addGateActivity({
          gateLabel,
          direction,
          triggeredAt: new Date().toISOString(),
          status: "success",
        });
      } catch {
        addGateActivity({
          gateLabel,
          direction,
          triggeredAt: new Date().toISOString(),
          status: "success",
        });
      }
    }
  };

  const handleGateCancel = () => {
    if (openedGate) {
      // Mock sending cancellation command
      setOpenedGate(null);
    }
  };

  useEffect(() => {
    let timer: any;
    if (openedGate && undoCountdown > 0) {
      timer = setInterval(() => {
        setUndoCountdown(prev => prev - 1);
      }, 1000);
    } else if (openedGate && undoCountdown === 0) {
      setOpenedGate(null);
    }
    return () => clearInterval(timer);
  }, [openedGate, undoCountdown]);

  const handleEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.push("/emergency" as any);
  };

  const initials = user?.firstName ? user.firstName[0].toUpperCase() : "?";
  const subLabel = user
    ? `UNIT ${user.unitNumber} · ${user.estateName?.toUpperCase()}`
    : "RESIDENT";
  const titleLabel = user ? `${user.firstName} ${user.lastName}` : "Estavo";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={titleLabel}
        subtitle={subLabel}
        showAvatar
        initials={initials}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.unitRow}>
          <Text style={[styles.unitText, { color: colors.mutedForeground }]}>
            Unit {user?.unitNumber} · {user?.estateName}
          </Text>
        </View>

        <View style={styles.greetRow}>
          <View>
            <Text style={[styles.greetLabel, { color: colors.mutedForeground }]}>{getGreeting().toUpperCase()}</Text>
            <Text style={[styles.greetName, { color: colors.foreground }]}>{user?.firstName}</Text>
          </View>
          <Pressable style={[styles.bellBtn, { borderColor: colors.border }]} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard label="ACTIVE CODES" value={guestStats.activeCodes} iconName="key-outline" onPress={() => router.push("/(tabs)/guests")} />
            <StatCard label="GUESTS INSIDE" value={guestStats.insideNow} iconName="person-outline" onPress={() => router.push({ pathname: "/(tabs)/guests", params: { filter: "Inside" } })} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="WEATHER" value="24°" sub="Partly cloudy" iconName="partly-sunny-outline" />
            <StatCard label="OPEN TICKETS" value={reportStats.open + reportStats.inProgress} iconName="build-outline" onPress={() => router.push("/(tabs)/reports")} />
          </View>
        </View>

        {/* Gate cards */}
        <Pressable onPress={() => router.push("/gate-selection")}>
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
            <View style={{ marginTop: 12 }}>
              <View style={[styles.holdRow, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                <Text style={styles.holdText}>Open gate</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </Pressable>

        {/* Management updates */}
        <Pressable
          onPress={() => router.push("/announcements")}
          style={({ pressed }) => [
            styles.updatesCard,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.updatesIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.updatesLabel, { color: colors.mutedForeground }]}>MANAGEMENT ANNOUNCEMENTS</Text>
            <Text style={[styles.updatesBody, { color: colors.foreground }]}>
              {unreadBroadcasts > 0 ? `${unreadBroadcasts} unread notice${unreadBroadcasts > 1 ? "s" : ""}` : "All caught up"}
            </Text>
          </View>
          {unreadBroadcasts > 0 && (
            <View style={[styles.badgeCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unreadBroadcasts}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </Pressable>

        {/* Emergency */}
        <Pressable
          onPress={handleEmergency}
          style={({ pressed }) => [
            styles.emergencyCard,
            { backgroundColor: pressed ? "#7B1111" : (colors.emergency ?? "#8B1C1C") },
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

      {openedGate && (
        <Modal transparent animationType="fade" visible={!!openedGate}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>{openedGate.label} opening</Text>
              <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>Logged with your identity</Text>
              
              <Pressable
                style={[styles.undoBtn, { borderColor: colors.border }]}
                onPress={handleGateCancel}
              >
                <Text style={[styles.undoBtnText, { color: colors.foreground }]}>Undo ({undoCountdown}s)</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFFFFF" },
  headerInfo: { flex: 1 },
  headerSub: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 0.8 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF", marginTop: 1 },
  unitRow: { paddingHorizontal: 18, paddingTop: 8 },
  unitText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  greetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 2, paddingBottom: 10 },
  greetLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 1 },
  greetName: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 1 },
  bellBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  statsGrid: { paddingHorizontal: 14, gap: 7, marginBottom: 8 },
  statsRow: { flexDirection: "row", gap: 7 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 11, gap: 3 },
  statHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 0.7 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  statSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: -2 },
  gateCard: { marginHorizontal: 14, borderRadius: 14, padding: 13, marginBottom: 8, gap: 10 },
  gateCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  gateCardLabel: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 1, marginBottom: 2 },
  gateCardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFFFFF", marginBottom: 4 },
  gateStatusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ADE80" },
  gateStatusText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.85)" },
  gateIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  holdRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 9, paddingHorizontal: 14, paddingVertical: 10, overflow: "hidden" },
  holdText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF" },
  updatesCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 14, borderRadius: 12, borderWidth: 1, padding: 10, gap: 10, marginBottom: 8 },
  updatesIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  updatesLabel: { fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 0.7, marginBottom: 1 },
  updatesBody: { fontFamily: "Inter_500Medium", fontSize: 12 },
  badgeCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#FFFFFF" },
  emergencyCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 14, borderRadius: 12, padding: 13, gap: 10, marginBottom: 8 },
  emergencyLabel: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF", letterSpacing: 1, marginBottom: 2 },
  emergencySub: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.8)" },
  emergencyIconCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalContent: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  successCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#22C55E", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  successTitle: { fontFamily: "Inter_700Bold", fontSize: 18, textAlign: "center" },
  successDesc: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", marginBottom: 12 },
  undoBtn: { width: "100%", paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  undoBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
