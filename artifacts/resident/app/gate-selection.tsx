import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import ScreenHeader from "@/components/ScreenHeader";

export default function GateSelectionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleGatePress = (gateId: string, gateName: string) => {
    router.push({
      pathname: "/gate-hold",
      params: { id: gateId, name: gateName },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        title="Open Gate"
        showBack
        rightIcon="settings-outline"
        onRightPress={() => router.push("/(tabs)/settings")}
      />
      <View style={styles.body}>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Choose a gate, then hold to open.
        </Text>
        
        <View style={[styles.gateGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.groupTitle, { color: colors.foreground }]}>Gate 1</Text>
          
          <Pressable 
            style={[styles.gateRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            onPress={() => handleGatePress("1_entry", "Gate 1 · Entry Gate")}
          >
            <View style={styles.gateInfo}>
              <Text style={[styles.gateName, { color: colors.foreground }]}>🚪 Entry Gate</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: "#4CAF50" }]} />
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Online</Text>
              </View>
            </View>
            <Text style={[styles.actionText, { color: colors.primary }]}>Hold to open →</Text>
          </Pressable>

          <Pressable 
            style={styles.gateRow}
            onPress={() => handleGatePress("1_exit", "Gate 1 · Exit Gate")}
          >
            <View style={styles.gateInfo}>
              <Text style={[styles.gateName, { color: colors.foreground }]}>🚪 Exit Gate</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: "#4CAF50" }]} />
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Online</Text>
              </View>
            </View>
            <Text style={[styles.actionText, { color: colors.primary }]}>Hold to open →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: 16 },
  subheading: { fontSize: 16, marginBottom: 24 },
  gateGroup: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  groupTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  gateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  gateInfo: { flex: 1 },
  gateName: { fontSize: 16, fontWeight: "500", marginBottom: 4 },
  statusRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 14 },
  actionText: { fontSize: 14, fontWeight: "600" },
});
