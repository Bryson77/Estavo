import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  View,
  Linking,
  Text,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

const HOLD_MS = 5000;

export default function EmergencyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { triggerEmergency } = useApp();

  const [isHolding, setIsHolding] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emergencyRef, setEmergencyRef] = useState<string | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(5);

  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const completedRef = useRef(false);

  // Pulsing ring animation when idle
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const startHold = useCallback(() => {
    if (triggered || loading || completedRef.current) return;
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    });
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
    Animated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: false }).start();
  }, [progress]);

  useEffect(() => {
    let timer: any;
    if (triggered && undoCountdown > 0) {
      timer = setInterval(() => {
        setUndoCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [triggered, undoCountdown]);

  useEffect(() => () => { animRef.current?.stop(); }, []);

  const fillWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const subLabel = user
    ? `RESIDENT · ${user.firstName?.toUpperCase()} ${user.lastName?.[0]?.toUpperCase()}.`
    : "RESIDENT";

  // ── Confirmed state ──────────────────────────────────────────────────
  if (triggered && emergencyRef) {
    return (
      <View style={[styles.screen, { backgroundColor: "#0D0000" }]}>
        <ScreenHeader
          title="Emergency"
          subtitle={subLabel}
          showBack
          headerBg="#7B1111"
        />
        <View style={styles.confirmedBody}>
          <View style={styles.sirensRow}>
            <Ionicons name="alarm" size={36} color="#EF4444" />
            <Ionicons name="alarm" size={52} color="#EF4444" />
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

          {undoCountdown > 0 && (
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                // Mock sending cancellation
                router.back();
              }}
            >
              <Text style={styles.cancelBtnText}>Undo ({undoCountdown}s)</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.cancelBtn, { backgroundColor: "transparent", borderWidth: 1, borderColor: "#EF4444", marginTop: undoCountdown > 0 ? 10 : 20 }]}
            onPress={() => {
              Linking.openURL("tel:0800123456");
            }}
          >
            <Ionicons name="call" size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={[styles.cancelBtnText, { color: "#EF4444" }]}>Call Security</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Main screen ──────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Emergency"
        subtitle="ESTATEHQ"
        showBack
        showAvatar={false}
        headerBg={colors.primary}
      />

      <View style={styles.body}>
        <Text style={[styles.instruction, { color: colors.mutedForeground }]}>
          Hold the button for 5 seconds to alert all security on duty.
        </Text>

        <Pressable 
          onPressIn={startHold} 
          onPressOut={stopHold}
          style={styles.holdContainer}
        >
          <View style={[styles.holdBox, { backgroundColor: colors.card, borderColor: "#EF4444" }]}>
            <Animated.View
              style={[StyleSheet.absoluteFill, { backgroundColor: "#EF4444", width: fillWidth as any }]}
            />
            <Text style={[styles.holdText, { color: isHolding || loading ? "#FFFFFF" : "#EF4444" }]}>
              {loading ? "Alerting..." : isHolding ? "Holding..." : "Hold to alert security"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 0,
  },
  instruction: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  holdContainer: {
    width: "100%",
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  holdBox: {
    flex: 1,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    overflow: "hidden",
  },
  holdText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    zIndex: 1,
  },
  // Confirmed state
  confirmedBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  sirensRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  confirmedTitle: { fontFamily: "Inter_700Bold", fontSize: 32, color: "#EF4444", letterSpacing: 2 },
  confirmedRef: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#EF444480" },
  confirmedDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#FFFFFF", textAlign: "center", lineHeight: 22 },
  confirmedUnit: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#FFFFFF66", marginBottom: 20 },
  cancelBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#7B1111", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: "100%" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },
});
