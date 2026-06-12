import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import ScreenHeader from "@/components/ScreenHeader";

export default function GateHoldScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name = "Gate" } = useLocalSearchParams<{ name: string }>();

  const [isHolding, setIsHolding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(5);
  
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const completedRef = useRef(false);

  const startHold = () => {
    if (completedRef.current) return;
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: 1500, // 1.5 seconds hold per PRD
      useNativeDriver: false,
    });
    
    animRef.current.start(({ finished }) => {
      if (finished && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });
  };

  const stopHold = () => {
    if (completedRef.current) return;
    setIsHolding(false);
    animRef.current?.stop();
    Animated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: false }).start();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (completed && undoSeconds > 0) {
      interval = setInterval(() => {
        setUndoSeconds((prev) => prev - 1);
      }, 1000);
    } else if (completed && undoSeconds === 0) {
      router.back();
    }
    return () => clearInterval(interval);
  }, [completed, undoSeconds, router]);

  const handleUndo = () => {
    // Send cancellation command in a real app
    router.back();
  };

  const fillWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  if (completed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <View style={[styles.successCircle, { backgroundColor: "#4CAF50" }]}>
          <Ionicons name="checkmark" size={48} color="white" />
        </View>
        <Text style={[styles.successText, { color: colors.foreground }]}>{name} opening</Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground }]}>Logged with your identity</Text>
        
        {undoSeconds > 0 && (
          <Pressable style={styles.undoBtn} onPress={handleUndo}>
            <Text style={styles.undoText}>Undo ({undoSeconds}s)</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader title={name} showBack />
      <View style={[styles.body, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.instruction, { color: colors.foreground }]}>Hold the button to open the gate.</Text>
        <Text style={[styles.subInstruction, { color: colors.mutedForeground }]}>5-second undo window after opening.</Text>
        
        <Pressable 
          onPressIn={startHold} 
          onPressOut={stopHold}
          style={styles.holdContainer}
        >
          <View style={[styles.holdBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Animated.View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, width: fillWidth as any }]}
            />
            <Text style={[styles.holdText, { color: isHolding ? "#FFFFFF" : colors.primary }]}>
              {isHolding ? "Holding..." : "Hold to open"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, padding: 24 },
  instruction: { fontSize: 20, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  subInstruction: { fontSize: 16, marginBottom: 48, textAlign: "center" },
  holdContainer: { width: "100%", height: 80, borderRadius: 40, overflow: "hidden" },
  holdBox: { flex: 1, borderWidth: 2, justifyContent: "center", alignItems: "center", borderRadius: 40, overflow: "hidden" },
  holdText: { fontSize: 20, fontWeight: "bold", zIndex: 1 },
  successCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  successText: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  successSub: { fontSize: 16, marginBottom: 48 },
  undoBtn: { paddingHorizontal: 32, paddingVertical: 16, backgroundColor: "rgba(255, 67, 54, 0.1)", borderRadius: 24 },
  undoText: { fontSize: 16, fontWeight: "bold", color: "#F44336" },
});
