import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const HOLD_MS = 3000;
const EMERGENCY_TYPES = [
  { id: "security", label: "Security Threat", icon: "shield-outline", color: "#EF4444" },
  { id: "medical", label: "Medical Emergency", icon: "medkit-outline", color: "#F59E0B" },
  { id: "fire", label: "Fire / Smoke", icon: "flame-outline", color: "#F97316" },
  { id: "crime", label: "Crime in Progress", icon: "warning-outline", color: "#DC2626" },
];

export default function EmergencyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { triggerEmergency } = useApp();

  const [selectedType, setSelectedType] = useState("security");
  const [isHolding, setIsHolding] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [emergencyRef, setEmergencyRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const completedRef = useRef(false);

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const startHold = useCallback(() => {
    if (triggered || loading || completedRef.current) return;
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    animRef.current = Animated.timing(progress, { toValue: 1, duration: HOLD_MS, useNativeDriver: false });
    animRef.current.start(async ({ finished }) => {
      if (finished && !completedRef.current) {
        completedRef.current = true;
        setIsHolding(false);
        setLoading(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        try {
          const result = await triggerEmergency();
          setEmergencyRef(result.emergencyRef);
          setTriggered(true);
        } catch (err: any) {
          Alert.alert("Error", err.message ?? "Failed to send alert.");
          completedRef.current = false;
          progress.setValue(0);
        } finally {
          setLoading(false);
        }
      }
    });
  }, [triggered, loading, progress, triggerEmergency]);

  const stopHold = useCallback(() => {
    if (completedRef.current) return;
    setIsHolding(false);
    animRef.current?.stop();
    Animated.timing(progress, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  }, [progress]);

  useEffect(() => () => { animRef.current?.stop(); }, []);

  const ring = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 130] });
  const ringOpacity = progress.interpolate({ inputRange: [0, 0.1], outputRange: [0, 1] });

  if (triggered && emergencyRef) {
    return (
      <View style={[styles.screen, { backgroundColor: "#1A0000" }]}>
        <View style={[styles.header, { backgroundColor: "#8B1C1C", paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.confirmedBody}>
          <View style={styles.sirensRow}>
            <Ionicons name="alarm" size={36} color="#EF4444" />
            <Ionicons name="alarm" size={50} color="#EF4444" />
            <Ionicons name="alarm" size={36} color="#EF4444" />
          </View>
          <Text style={styles.confirmedTitle}>ALERT SENT</Text>
          <Text style={styles.confirmedRef}>Ref: {emergencyRef}</Text>
          <Text style={styles.confirmedDesc}>
            Security has been notified and is responding.{"\n"}Stay on the line if possible.
          </Text>
          <Text style={styles.confirmedUnit}>
            Unit {user?.unitNumber} · {user?.estateName}
          </Text>
          <View style={styles.confirmedActions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: "#8B1C1C" }]}
              onPress={() => {
                Alert.alert("Cancel Alert", "This will mark the alert as a false alarm.", [
                  { text: "Keep Active", style: "cancel" },
                  { text: "Cancel Alert", style: "destructive", onPress: () => router.back() },
                ]);
              }}
            >
              <Text style={styles.actionBtnText}>Cancel (False Alarm)</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#8B1C1C", paddingTop: topPad + 12 }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.headerLabel}>SOS</Text>
            <Text style={styles.headerTitle}>Emergency</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SELECT TYPE</Text>
        <View style={styles.typeGrid}>
          {EMERGENCY_TYPES.map(t => (
            <Pressable
              key={t.id}
              style={({ pressed }) => [
                styles.typeBtn,
                {
                  backgroundColor: selectedType === t.id ? t.color + "18" : colors.card,
                  borderColor: selectedType === t.id ? t.color : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => { setSelectedType(t.id); Haptics.selectionAsync(); }}
            >
              <Ionicons name={t.icon as any} size={20} color={selectedType === t.id ? t.color : colors.mutedForeground} />
              <Text style={[styles.typeBtnText, { color: selectedType === t.id ? t.color : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.holdInstruction, { color: colors.mutedForeground }]}>
          Hold the button for 3 seconds to alert security
        </Text>

        <View style={styles.holdArea}>
          <Animated.View
            style={[styles.holdRing, { width: ring, height: ring, borderRadius: 200, opacity: ringOpacity, borderColor: "#EF4444" }]}
          />
          <TouchableWithoutFeedback onPressIn={startHold} onPressOut={stopHold}>
            <Animated.View style={[styles.holdCircle, { backgroundColor: isHolding || loading ? "#DC2626" : "#8B1C1C" }]}>
              <Ionicons name="alarm-outline" size={34} color="#FFFFFF" />
              <Text style={styles.holdCircleLabel}>
                {loading ? "Alerting..." : isHolding ? "Hold..." : "SOS"}
              </Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Only use this in genuine emergencies.{"\n"}False alarms may result in disciplinary action.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerLabel: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  body: { flex: 1, padding: 20 },
  sectionLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: "47%",
  },
  typeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  holdInstruction: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", marginBottom: 32, lineHeight: 20 },
  holdArea: { alignItems: "center", justifyContent: "center", height: 180, marginBottom: 32 },
  holdRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  holdCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  holdCircleLabel: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  disclaimer: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", lineHeight: 18 },
  confirmedBody: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  sirensRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  confirmedTitle: { fontFamily: "Inter_700Bold", fontSize: 32, color: "#EF4444", letterSpacing: 2 },
  confirmedRef: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#EF444490" },
  confirmedDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#FFFFFF", textAlign: "center", lineHeight: 22 },
  confirmedUnit: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#FFFFFF88" },
  confirmedActions: { marginTop: 20, width: "100%" },
  actionBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  actionBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },
});
